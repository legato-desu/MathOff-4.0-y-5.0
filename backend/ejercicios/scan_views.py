import io
import json
import os
import re
import subprocess
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image, ImageEnhance, ImageOps, UnidentifiedImageError
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def normalize_equation(raw_text):
    """Turn a single OCR line into editable math.js input, without guessing symbols."""
    text = raw_text.strip().replace("×", "*").replace("÷", "/")
    text = text.replace("−", "-").replace("–", "-").replace("²", "^2")
    text = re.sub(r"\s+", "", text)
    text = re.sub(r"^(?:y|f\(x\))=", "", text, flags=re.IGNORECASE)
    text = text.replace("X", "x")
    # OCR suele separar letras y números: x + 2 se conserva y 2x se convierte en 2*x.
    text = re.sub(r"(?<=\d)(?=[a-zA-Z(])", "*", text)
    text = re.sub(r"(?<=[)x])(?=\d|x|\()", "*", text)
    return text


def normalize_latex(raw_text):
    """Convert common formula OCR LaTeX into editable math.js syntax."""
    text = raw_text.strip()
    text = re.sub(r"\\(?:mathrm|text|mathbf|mathit)\{([^{}]*)\}", r"\1", text)
    text = text.replace(r"\left", "").replace(r"\right", "")
    text = text.replace(r"\cdot", "*").replace(r"\times", "*")
    text = text.replace(r"\pi", "pi")
    for name in ("sin", "cos", "tan", "ln", "log"):
        text = text.replace(f"\\{name}", "log" if name == "ln" else name)
    while re.search(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", text):
        text = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", text)
    text = re.sub(r"\\sqrt\{([^{}]+)\}", r"sqrt(\1)", text)
    text = re.sub(r"\^\{([^{}]+)\}", r"^(\1)", text)
    if "\\" in text or "{" in text or "}" in text:
        return ""
    expression = normalize_equation(text)
    return expression if re.fullmatch(r"[0-9a-zA-Z.+\-*/^()= ]+", expression) else ""


def recognize_with_formula_model(image_bytes):
    url = os.environ.get("MATHOFF_OCR_URL", "http://127.0.0.1:8765/recognize")
    request = Request(url, data=image_bytes, headers={"Content-Type": "image/png"}, method="POST")
    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
    except (HTTPError, URLError, OSError, ValueError):
        return None
    raw_text = result.get("text", "")
    expression = normalize_latex(raw_text)
    if not expression:
        return None
    return {"raw_text": raw_text, "expression": expression, "engine": "pix2text"}


class ScanEquationView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        uploaded = request.FILES.get("image")
        if not uploaded:
            return Response({"detail": "Selecciona una imagen."}, status=status.HTTP_400_BAD_REQUEST)
        if uploaded.size > 8 * 1024 * 1024:
            return Response({"detail": "La imagen no puede superar 8 MB."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            image = Image.open(uploaded)
            image.verify()
            uploaded.seek(0)
            image = ImageOps.exif_transpose(Image.open(uploaded)).convert("L")
        except (UnidentifiedImageError, OSError, ValueError):
            return Response({"detail": "El archivo no es una imagen válida."}, status=status.HTTP_400_BAD_REQUEST)

        image.thumbnail((1800, 1800))
        image = ImageOps.autocontrast(image)
        image = ImageEnhance.Contrast(image).enhance(1.8)
        # Escala la imagen pequeña y mejora el contraste para OCR de expresiones cortas.
        if max(image.size) < 1400:
            factor = min(3, 1400 / max(image.size))
            image = image.resize((int(image.width * factor), int(image.height * factor)))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")

        formula_result = recognize_with_formula_model(buffer.getvalue())
        if formula_result:
            return Response({
                **formula_result,
                "message": "Revisa y corrige la expresión antes de graficar.",
            })

        try:
            result = subprocess.run(
                ["tesseract", "stdin", "stdout", "--psm", "7", "-l", "eng"],
                input=buffer.getvalue(), capture_output=True, timeout=20, check=True,
            )
        except FileNotFoundError:
            return Response({"detail": "Tesseract no está instalado en el servidor local."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            return Response({"detail": "No se pudo procesar la imagen. Intenta otra foto."}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        raw_text = result.stdout.decode("utf-8", errors="replace").strip()
        expression = normalize_equation(raw_text)
        # Retira artefactos frecuentes de OCR, pero deja que el usuario revise el resultado.
        expression = re.sub(r"[^0-9a-zA-Z.+\-*/^()= ]", "", expression)
        return Response({
            "raw_text": raw_text,
            "expression": expression,
            "engine": "tesseract",
            "message": "Revisa y corrige la expresión antes de graficar.",
        })
