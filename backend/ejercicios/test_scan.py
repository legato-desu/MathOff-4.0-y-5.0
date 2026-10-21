import io
import shutil
from unittest import skipUnless

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image, ImageDraw, ImageFont
from rest_framework.test import APIClient

from users.models import User
from .scan_views import normalize_equation


class ScanEquationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def image_file(self):
        image = Image.new("RGB", (900, 170), "white")
        font = ImageFont.load_default(size=78)
        ImageDraw.Draw(image).text((20, 25), "y=2x+1", fill="black", font=font)
        output = io.BytesIO()
        image.save(output, format="PNG")
        return SimpleUploadedFile("equation.png", output.getvalue(), content_type="image/png")

    def test_normalizes_equation_without_guessing_unknown_symbols(self):
        self.assertEqual(normalize_equation(" f(x) = 2X + 1 "), "2x+1")
        self.assertEqual(normalize_equation("y = x² − 3"), "x^2-3")

    def test_requires_authentication(self):
        response = self.client.post("/api/math/scan/", {"image": self.image_file()}, format="multipart")
        self.assertEqual(response.status_code, 401)

    def test_rejects_invalid_image(self):
        self.client.force_authenticate(user=User.objects.create_user("student", password="test-pass"))
        invalid = SimpleUploadedFile("bad.png", b"not an image", content_type="image/png")
        response = self.client.post("/api/math/scan/", {"image": invalid}, format="multipart")
        self.assertEqual(response.status_code, 400)

    @skipUnless(shutil.which("tesseract"), "Tesseract is required for an OCR integration test")
    def test_recognizes_clear_linear_equation(self):
        self.client.force_authenticate(user=User.objects.create_user("student", password="test-pass"))
        response = self.client.post("/api/math/scan/", {"image": self.image_file()}, format="multipart")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["expression"], "2x+1")
