# MathOff — Graficador y aprendizaje de funciones matemáticas

MathOff es una plataforma educativa multiplataforma que ayuda a estudiantes y docentes a trabajar con funciones matemáticas mediante graficación, reconocimiento de ecuaciones escritas a mano, ejercicios y visualización de información. Integra una aplicación web, una aplicación móvil y una API centralizada.

> **Estado del despliegue:** el backend y PostgreSQL se alojan en Render (plan gratuito); la interfaz web se publica como sitio estático —incluido el despliegue en GitHub Pages cuando esa es la URL activa configurada— y la aplicación móvil se ejecuta en Expo Go durante desarrollo y demostraciones. Los enlaces y variables de entorno deben revisarse si cambia el despliegue.

## Contenido

- [Objetivo](#objetivo)
- [Funcionalidades](#funcionalidades-principales)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Despliegue](#despliegue)
- [Ejecución local](#ejecución-local)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Autenticación y roles](#autenticación-y-roles)
- [Industria 4.0 e Industria 5.0](#relación-con-industria-40-e-industria-50)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Seguridad](#seguridad)
- [Autores](#autores)

## Objetivo

Ofrecer una herramienta de apoyo al aprendizaje de funciones matemáticas que facilite el paso de la expresión escrita a su representación gráfica y permita trabajar con ejercicios en un entorno web o móvil. El sistema centraliza la información compartida y ofrece interfaces diferenciadas según el contexto de uso.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Autenticación basada en tokens JWT.
- Asignación de roles y acceso diferenciado para administrador, docente y estudiante.
- Creación y consulta de ejercicios.
- Envío y almacenamiento de respuestas asociadas a estudiantes y ejercicios.
- Graficación de expresiones matemáticas.
- Flujo de escaneo/reconocimiento de ecuaciones, sujeto a la disponibilidad y configuración del componente OCR.
- Dashboard y vistas de análisis en la web.
- Interfaces web y móvil que consumen la misma API.
- Persistencia de datos en una base relacional.

La disponibilidad exacta de cada operación depende de la conectividad con la API y de la configuración del despliegue.

## Arquitectura

El sistema utiliza una arquitectura **cliente-servidor**, organizada en tres capas lógicas:

1. **Presentación — web:** interfaz React con TypeScript y Vite, ejecutada en el navegador.
2. **Presentación — móvil:** aplicación React Native con Expo, probada mediante Expo Go.
3. **Aplicación y datos:** API Django REST Framework y base de datos PostgreSQL en producción.

```text
┌──────────────────────┐        ┌──────────────────────┐
│ Cliente web          │        │ Cliente móvil        │
│ React + TypeScript   │        │ React Native + Expo  │
│ Dashboard y gráficas │        │ Pantallas y cámara   │
└──────────┬───────────┘        └──────────┬───────────┘
           │          HTTPS / JSON         │
           └────────────────┬──────────────┘
                            ▼
                 ┌────────────────────┐
                 │ API REST           │
                 │ Django + DRF       │
                 │ JWT, validaciones, │
                 │ reglas y permisos  │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ PostgreSQL         │
                 │ Render             │
                 └────────────────────┘
```

La API desacopla las interfaces de la persistencia: los clientes no acceden directamente a PostgreSQL. El backend está organizado en aplicaciones Django; esto es una arquitectura modular dentro de un backend, no necesariamente una arquitectura de microservicios independientes.

## Tecnologías

| Área | Tecnologías |
|---|---|
| Web | React, TypeScript, Vite, Math.js |
| Móvil | React Native, Expo, TypeScript |
| Backend | Python, Django, Django REST Framework |
| Autenticación | SimpleJWT / JWT |
| Persistencia | PostgreSQL en producción; SQLite configurable para desarrollo local |
| ORM | Django ORM |
| Servidor de aplicación | Gunicorn |
| Hosting del backend y base de datos | Render |
| Versionamiento | Git y GitHub |
| App móvil en pruebas | Expo Go |

## Estructura del repositorio

```text
MathOff-4.0-y-5.0/
├── backend/
│   ├── config/          # settings, rutas globales y configuración Django
│   ├── users/           # usuario, autenticación y serializers/vistas asociadas
│   ├── roles/           # modelo y gestión de roles
│   ├── ejercicios/      # ejercicios matemáticos
│   ├── respuestas/     # respuestas relacionadas con usuario y ejercicio
│   ├── tareas/          # módulo de tareas
│   ├── reportes/        # módulo de reportes
│   └── manage.py        # comandos administrativos Django
├── web/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts       # comunicación con la API
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   ├── Graph.tsx
│   │   ├── Scanner.tsx
│   │   ├── Learning.tsx
│   │   └── styles.css
│   └── vite.config.ts
├── frontend/
│   ├── src/
│   │   ├── navigation/  # navegación de la aplicación
│   │   ├── screens/     # pantallas móviles
│   │   ├── components/  # componentes reutilizables
│   │   ├── servicios/   # configuración y llamadas a la API
│   │   ├── store/       # estado de autenticación y funciones
│   │   ├── styles/      # estilos de pantallas
│   │   ├── theme/       # tema y colores
│   │   └── utils/       # utilidades
│   └── App.tsx
└── render.yaml          # definición declarativa de servicios Render
```

Las carpetas `migrations/` dentro de las aplicaciones Django guardan los cambios versionados del esquema de la base de datos.

## Despliegue

### Backend y PostgreSQL en Render

El archivo `render.yaml` declara los servicios de Render. En términos generales:

- PostgreSQL se define como una base de datos llamada `mathoff-db`.
- El backend Python instala las dependencias desde `backend/requirements.txt`.
- Se ejecuta `collectstatic` para recopilar archivos estáticos.
- Antes de arrancar, se aplican migraciones con `python manage.py migrate --noinput`.
- Gunicorn ejecuta la aplicación WSGI de Django.

La configuración de base de datos se encuentra en `backend/config/settings.py`. El proyecto lee `MATHOFF_DATABASE_URL` y, como alternativa, `DATABASE_URL`; `dj-database-url` interpreta la cadena y configura el motor.

### Web

La aplicación web se compila con Vite. El servicio estático de Render está descrito en `render.yaml`; si se utiliza GitHub Pages como URL pública de la web, debe configurarse la URL de API correspondiente y verificarse que las rutas y los orígenes CORS estén permitidos por el backend.

Archivo relevante: `web/src/api.ts`.

### Aplicación móvil

La aplicación móvil utiliza Expo y puede ejecutarse mediante Expo Go para pruebas y demostraciones. Expo Go es un entorno de ejecución para desarrollo; por sí solo no significa que exista una versión publicada en Google Play o App Store.

## Ejecución local

Requisitos generales: Python compatible con las dependencias del backend, Node.js/npm y Expo CLI (a través de `npx expo`).

### 1. Backend

Desde la carpeta `backend/`:

```bash
python -m venv .venv
```

Activar el entorno virtual:

```bash
# Linux/macOS
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1
```

Instalar dependencias y preparar la base local:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Si no se define `MATHOFF_DATABASE_URL` ni `DATABASE_URL`, la configuración actual utiliza SQLite local. Para conectar PostgreSQL, define una URL de base de datos en el entorno y **no la publiques en Git**.

### 2. Web

En otra terminal, desde `web/`:

```bash
npm install
```

Crea un archivo `.env` local a partir de `.env.example` si existe y define la URL de la API, por ejemplo:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Luego ejecuta:

```bash
npm run dev
```

Vite mostrará la dirección local disponible en la terminal. Para compilar la web:

```bash
npm run build
```

### 3. Móvil

Desde `frontend/`:

```bash
npm install
npx expo start
```

Abre Expo Go en el teléfono y escanea el código QR. El teléfono y el equipo deben poder comunicarse por la red. Para acceder a un backend local desde un teléfono físico, utiliza la dirección IP local del computador, no `127.0.0.1`. Para producción, configura la URL pública de la API en el archivo de configuración correspondiente.

## Base de datos y migraciones

Django ORM mapea modelos Python a tablas relacionales. Los modelos principales incluyen:

- `users.User`: usuario personalizado y relación con un rol.
- `roles.Role`: nombre y descripción del rol.
- `ejercicios.Ejercicio`: título, descripción, función correcta, creador y fecha.
- `respuestas.Respuesta`: estudiante, ejercicio, texto de respuesta, indicador de corrección y fecha.

Para crear migraciones después de modificar un modelo:

```bash
python manage.py makemigrations
python manage.py migrate
```

`makemigrations` genera archivos de migración y `migrate` los aplica a la base configurada. La instancia PostgreSQL de producción se provisiona en Render; Django crea y actualiza las tablas de la aplicación a través de migraciones.

## Autenticación y roles

El backend usa Django REST Framework y SimpleJWT. Las peticiones protegidas incluyen el token de acceso en la cabecera:

```http
Authorization: Bearer <access_token>
```

El modelo actual de usuario contiene un `ForeignKey` hacia `Role`; por tanto, **un usuario tiene un rol asignado como máximo en esta relación**. Los roles previstos para la aplicación son administrador, docente y estudiante. Si en el futuro se requiere que un usuario tenga varios roles simultáneos, se debe cambiar el modelo y adaptar permisos, serialización, migraciones y la interfaz.

La seguridad efectiva depende de que los permisos se validen en el backend, no solamente de ocultar opciones en la interfaz.

## Relación con Industria 4.0 e Industria 5.0

MathOff es un proyecto educativo, no un sistema de control industrial. Su relación con los conceptos de Industria 4.0 y 5.0 consiste en aplicar principios digitales al aprendizaje, y conviene describirla en esos términos.

### Industria 4.0: digitalización e integración

- **Integración de sistemas:** una API REST conecta la web y el móvil con un backend centralizado.
- **Digitalización de procesos:** ejercicios, respuestas y parte del seguimiento académico pasan a manejarse digitalmente.
- **Reconocimiento de información:** el flujo OCR busca convertir escritura matemática en una expresión que pueda procesarse.
- **Datos para seguimiento:** el dashboard web permite visualizar información y apoyar el análisis de actividad.
- **Acceso multiplataforma:** diferentes clientes consumen los mismos servicios y datos.

Estos elementos ilustran integración y transformación digital. No implican que el proyecto incorpore automáticamente IoT, gemelos digitales o automatización industrial.

### Industria 5.0: enfoque humano, resiliencia y sostenibilidad

- **Centrada en las personas:** busca facilitar la interacción de estudiantes y docentes con expresiones matemáticas, reduciendo la dificultad de digitación.
- **Apoyo a la labor docente:** los ejercicios, roles y paneles pueden apoyar el seguimiento de la actividad educativa.
- **Resiliencia y conectividad limitada:** las operaciones que se ejecutan localmente pueden reducir la dependencia de la red; sin embargo, registro, autenticación, gestión centralizada y sincronización requieren conexión con la API.
- **Uso responsable de recursos:** una solución web y móvil compartiendo backend evita duplicar servicios de datos. La sostenibilidad ambiental no ha sido medida formalmente y no debe presentarse como un resultado cuantificado.

En resumen, Industria 4.0 aporta la mirada de integración y digitalización; Industria 5.0 complementa esa mirada poniendo en primer plano las necesidades humanas y la resiliencia del servicio.

## Limitaciones conocidas

- El plan gratuito de hosting puede tener límites de recursos y demoras cuando el servicio despierta después de un periodo de inactividad. La disponibilidad y las condiciones exactas dependen del proveedor y pueden cambiar.
- Las funciones que requieren datos centralizados dependen de la conexión con la API.
- El OCR puede interpretar incorrectamente símbolos según la iluminación, el encuadre y la escritura; el resultado debe revisarse.
- No se debe afirmar que toda la aplicación funciona completamente offline a menos que se haya implementado y probado almacenamiento local, operación desconectada y sincronización.
- Expo Go sirve para pruebas de la app, pero no sustituye la publicación de una aplicación independiente en las tiendas.
- La precisión del OCR, la usabilidad y el rendimiento deben evaluarse mediante pruebas documentadas en condiciones representativas.

## Seguridad

- No sube archivos `.env`, contraseñas, `SECRET_KEY`, tokens ni cadenas de conexión.
- Usa variables de entorno en Render para los secretos de producción.
- Mantiene `DEBUG=False` en producción.
- Limita los orígenes CORS a los dominios necesarios; evita permitir todos los orígenes en un despliegue público si no es necesario.
- Valida permisos y propiedad de los recursos en el backend.
- Evita incluir usuarios y contraseñas de prueba reales en documentación pública.

## Autores

- **Andrés Julián Granja Andrade**
- **Iván David Miranda Castro**

Proyecto académico — Ingeniería de Software, Universidad de Cundinamarca, Seccional Girardot.

