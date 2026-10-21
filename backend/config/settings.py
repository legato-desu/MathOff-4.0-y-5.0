from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from decouple import config

# Directorio raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Configuración básica de seguridad
DEBUG = config("DEBUG", default=True, cast=bool)
SECRET_KEY = config("SECRET_KEY", default="mathoff-local-development-only")

if not DEBUG and SECRET_KEY == "mathoff-local-development-only":
    raise RuntimeError("Configura SECRET_KEY en el entorno de producción.")

# Hosts permitidos
ALLOWED_HOSTS = [host.strip() for host in config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1,10.0.2.2" if not DEBUG else "localhost,127.0.0.1,10.0.2.2,*"
).split(",") if host.strip()]

# Aplicaciones del proyecto
INSTALLED_APPS = [
    # Django base
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Terceros
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders", 

    # Aplicaciones locales
    "roles",
    "users",
    "ejercicios",
    "tareas",
    "respuestas",
    "reportes",
]

# Middlewares (CORS debe ir siempre lo más arriba posible)
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", 
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Manejo de archivos estáticos
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"

# Plantillas
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Base de datos (Soporte para SQLite local y PostgreSQL en Render)
DATABASE_URL = config(
    "MATHOFF_DATABASE_URL",
    default=config("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
)
DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}

# Modelo de usuario personalizado
AUTH_USER_MODEL = "users.User"

# Django Rest Framework y JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# Validadores de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internacionalización y Zona Horaria
LANGUAGE_CODE = "es-co"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

# Archivos estáticos
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Configuración Maestra de CORS y CSRF
cors_origins_raw = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://mathoff-web.onrender.com,https://legato-desu.github.io"
)

CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in cors_origins_raw.replace("\n", "").split(",")
    if origin.strip()
]

# Copia los orígenes de CORS hacia CSRF para asegurar peticiones POST seguras
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()
CORS_ALLOW_CREDENTIALS = True

# Configuración de proxies y cookies seguras para HTTPS (Render)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
