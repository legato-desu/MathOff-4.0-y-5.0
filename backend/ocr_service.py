"""Local formula OCR service. Run with Python 3.11 and Pix2Text installed."""

import io
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image, ImageOps
from pix2text.latex_ocr import LatexOCR


MODEL_DIR = os.environ.get("MATHOFF_OCR_MODEL_DIR")
if not MODEL_DIR:
    raise SystemExit("Configura MATHOFF_OCR_MODEL_DIR con la carpeta del modelo Pix2Text.")

ocr = LatexOCR(model_dir=MODEL_DIR, device="cpu")


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/recognize":
            self.send_error(404)
            return
        size = int(self.headers.get("Content-Length", "0"))
        if not 0 < size <= 8 * 1024 * 1024:
            self.send_error(413)
            return
        try:
            image = ImageOps.exif_transpose(Image.open(io.BytesIO(self.rfile.read(size)))).convert("RGB")
            image.thumbnail((1800, 1800))
            result = ocr(image)
            body = json.dumps(result).encode("utf-8")
        except (OSError, ValueError) as error:
            self.send_error(422, str(error))
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("MATHOFF_OCR_PORT", "8765"))
    print(f"OCR matemático local: http://127.0.0.1:{port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
