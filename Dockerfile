# 1. CONSTRUIR EL FRONTEND (Node.js)
FROM node:20-alpine as build-step

WORKDIR /app-frontend

# Copiamos primero los package para aprovechar el caché de Docker
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copiamos el resto del código del frontend
COPY frontend/ ./
RUN npm run build

# 2. CONFIGURAR EL BACKEND (Python)
FROM python:3.9

# Configuración de usuario para HF Spaces
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Instalar dependencias de Python
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copiar el código del backend
COPY --chown=user . .

# COPIAR EL FRONTEND CONSTRUIDO
# Movemos lo que Vite generó (carpeta dist) a una carpeta static en Python
COPY --chown=user --from=build-step /app-frontend/dist /app/static

# Lanzar la app
CMD ["python", "app.py"]