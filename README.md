# Asesor de Imagen IA 📸✨

Bienvenido al monorepo del **Sistema de Asesoría de Imagen Mediante Inteligencia Artificial**. Este proyecto es una aplicación móvil (React Native) impulsada por un core de negocio en Node.js y un microservicio matemático de Visión Artificial (MediaPipe).

El objetivo principal de la aplicación es identificar de manera automática la **morfología corporal y facial** de un usuario mediante su cámara móvil, para así ofrecerle **recomendaciones de moda altamente personalizadas**, bajo el estricto cumplimiento de privacidad de "Cero Retención".

---

## 🏛 Arquitectura del Sistema

El proyecto está dividido y desacoplado en tres componentes principales para garantizar escalabilidad, seguridad y mantenimiento modular. 

A continuación, puedes hacer clic en cada uno de ellos para leer a profundidad cómo trabajan internamente:

### 1. [Frontend Mobile (React Native)](./frontend/README.md)
Es la capa de experiencia de usuario (UX). Implementa flujos de _Onboarding_ restrictivos, una _Cámara Asistida_ inteligente (evalúa la iluminación y la estabilidad antes de permitir la captura) y el *Feed de Descubrimiento* (estilo Swipe) donde se despliegan las recomendaciones visuales curadas por la IA.

### 2. [Microservicio de IA (Python + FastAPI)](./ai_service/README.md)
El cerebro analítico. Recibe la imagen capturada (en formato cifrado) y la procesa enteramente en la memoria RAM para evitar cualquier guardado físico en discos. Extrae las coordenadas exactas de hombros, cintura, caderas y rostro para devolver únicamente variables matemáticas al servidor central.

### 3. [Backend Core (Node.js + MongoDB)](./backend/README.md)
Es la pasarela central y la capa de persistencia lógica. Recibe las medidas corporales, clasifica en qué tipo de silueta encaja el usuario (ej. Reloj de Arena, Triángulo) e interactúa con un catálogo extenso de ropa almacenado en MongoDB. También incluye un *Feedback Loop* para aprender de los gustos del usuario a medida que interactúa con la aplicación.

---

## 🔒 Privacidad y "Cero Retención"
Este software fue diseñado priorizando la confidencialidad. 
**No se almacenan fotografías de los cuerpos o rostros de los usuarios bajo ninguna circunstancia.** Las imágenes se destruyen mediante forzado de recolección de basura (*Garbage Collection*) en milisegundos una vez la IA ha calculado la distancia matemática en píxeles. Únicamente persisten números anónimos en la Base de Datos.

---

## 🚀 Guía de Instalación Rápida (Docker)

El proyecto está diseñado para ser clonado y levantado en cualquier máquina (Windows, Mac, Linux) sin dolor de cabeza de configuraciones. Para la infraestructura del servidor (Base de Datos + Node.js + Python), utilizamos Docker.

### 1. Clonar el repositorio y levantar servidores
Abre tu terminal en la carpeta donde deseas guardar el proyecto y ejecuta:
```bash
git clone https://github.com/Darkops56/AsesorImagenIA.git
cd AsesorImagenIA

# Construir y levantar contenedores en segundo plano
docker-compose up --build -d
```
> **Nota:** La primera vez tomará algunos minutos mientras Docker descarga las imágenes de Python, Node.js y MongoDB.
> **Comandos útiles:**
> - Ver si están corriendo: `docker ps`
> - Ver logs del backend: `docker logs asesor_backend`
> - Bajar los servicios: `docker-compose down`

### 2. Configurar y levantar el Frontend Móvil
El frontend requiere correr localmente en tu computadora para comunicarse con tu celular o emulador mediante Expo.
```bash
cd frontend

# Instalar dependencias
npm install

# Actualizar tu IP dinámica para que el celular encuentre los contenedores
npm run update-ip

# Levantar la aplicación de Expo
npx expo start -c
```
Escanea el código QR que aparecerá en tu terminal con la app de "Expo Go" en tu celular.

---
### 🛠 Solución de Errores Comunes
- **El celular no conecta al servidor:** Asegúrate de estar en la misma red Wi-Fi que la PC. Si cambiaste de red, debes volver a correr `npm run update-ip` dentro de la carpeta `frontend`.
- **Puerto 27017 o 3000 o 8000 en uso:** Si Docker se queja de puertos en uso, significa que tienes un MongoDB, Node o Python corriendo localmente en esos puertos. Ciérralos e intenta levantar `docker-compose` de nuevo.