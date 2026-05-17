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