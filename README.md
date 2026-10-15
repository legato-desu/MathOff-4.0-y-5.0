# MathOff

Aplicación educativa para practicar funciones. La interfaz web principal usa React, TypeScript y Vite; la API y los usuarios siguen en Django. Incluye cámara, reconocimiento de fórmulas, graficador, biblioteca y paneles por rol. La aplicación Expo anterior sigue disponible para Android/iOS.

## Iniciar la aplicación web

Requisitos: Node.js/npm y Python 3.14 para Django. En `backend`, prepara la base local y arranca la API:

```bash
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver 0.0.0.0:8000
```

En otra terminal, desde `web`:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite envía las llamadas `/api` a Django en el puerto 8000. Para una compilación de producción: `npm run build`.

## Ejecutarlo desde Code‑OSS

Abre como carpeta de trabajo `/home/david/MathOff` (la carpeta que contiene `MathOff_app-main` y `.vscode`). Luego usa **Terminal → Run Task…** o `Ctrl+Shift+P` → **Tasks: Run Task** y arranca estas tareas, cada una en su propia terminal:

1. `MathOff: API Django`
2. `MathOff: Web PC (React)`
3. `MathOff: App móvil (Expo SDK 57)`
4. `MathOff: OCR Pix2Text` (después de la preparación del apartado OCR)

La web abre en `http://localhost:5173`; Expo muestra el QR para abrir la app nativa en Expo Go. Cuando termines, usa `Ctrl+C` en cada terminal. No arranques otra copia si alguno de los servidores ya está ocupando su puerto.

## Reconocimiento de ecuaciones

El OCR especializado es gratuito y se ejecuta localmente en CPU. Requiere Python 3.11, unos 120 MB para los pesos del modelo y espacio adicional para las dependencias. La primera preparación descarga los pesos desde Hugging Face; después el reconocimiento funciona sin enviar imágenes a servicios externos.

Desde `backend`, crea el entorno separado e instala las dependencias:

```bash
python3.11 -m venv .ocr-venv
.ocr-venv/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
.ocr-venv/bin/pip install -r ocr-requirements.txt
```

Descarga y prepara Pix2Text una sola vez:

```bash
.ocr-venv/bin/python -c "from pix2text.latex_ocr import LatexOCR; LatexOCR(root='ocr-models', device='cpu')"
```

En una terminal, inicia el servicio OCR (ajusta la ruta absoluta si el proyecto está en otro lugar):

```bash
MATHOFF_OCR_MODEL_DIR=/ruta/MathOff_app-main/backend/ocr-models/1.1/mfr-1.5-onnx .ocr-venv/bin/python ocr_service.py
```

Django debe seguir ejecutándose en el puerto 8000. El escáner intenta Pix2Text en `127.0.0.1:8765` y usa Tesseract como respaldo si el servicio especializado no está disponible o no puede convertir el resultado a una expresión. Para instalar Tesseract en Ubuntu/Debian: `sudo apt install tesseract-ocr tesseract-ocr-eng`.

En la web, inicia sesión, abre **Escáner**, permite la cámara, toma una foto y pulsa **Reconocer ecuación**. Corrige el resultado si hace falta y pulsa **Graficar expresión**. El reconocimiento depende de la iluminación, el encuadre y la escritura; la revisión manual sigue siendo necesaria. La cámara del navegador requiere `localhost` o HTTPS.

## Aplicación móvil nativa Expo

MathOff ya incluye una app móvil React Native con cámara nativa (`expo-camera`); no se abre como página web en el teléfono. Para verla en vivo, instala **Expo Go** desde Play Store o App Store, conecta el teléfono y el computador a la misma red Wi-Fi y escanea el QR del servidor Expo. En el proyecto ya quedó configurada la URL de API de este computador en `frontend/.env` (`192.168.2.187`); si cambia la IP, actualízala.

La app móvil está alineada con Expo SDK 57, React 19.2 y React Native 0.86.3. Para verificar la compatibilidad de paquetes tras instalar dependencias, ejecuta `npx expo install --check`. Expo Go para iOS requiere iniciar sesión con la misma cuenta de Expo en la app y en la CLI; en Android el inicio de sesión se recomienda, pero actualmente no es obligatorio.

```bash
cd frontend
npm install
npm run start:lan
```

Escanea el QR desde la app Expo Go. La app se ejecuta en el entorno nativo de Expo Go y usa `CameraView` para abrir la cámara física; Expo sirve el código de desarrollo por la red local. Django debe continuar activo en `0.0.0.0:8000`. Si UFW bloquea el acceso a Django, habilita el puerto 8000 para la red Wi‑Fi local:

```bash
sudo ufw allow from 192.168.2.0/24 to any port 8000 proto tcp
```

Si el computador cambia de red, sustituye `192.168.2.0/24` por la subred local actual. Para un emulador Android, la dirección de API habitual es `http://10.0.2.2:8000/api`.

La base de desarrollo usa SQLite local. `MATHOFF_DATABASE_URL` permite cambiarla; no se utiliza Render.

## Tecnologías

Web: React 19, TypeScript, Vite y Math.js. Móvil existente: React Native y Expo. API: Django REST Framework y SimpleJWT. OCR local: Pix2Text/ONNX, Pillow y Tesseract de respaldo.

Autores: Iván David Miranda Castro y Andrés Julián Granja Andrade.
