# Microservicio de Inteligencia Artificial 🧠👁️

## ¿Qué hace este servicio?
Este microservicio es un servidor API ultra-ligero desarrollado en **Python con FastAPI** enfocado única y exclusivamente en Visión por Computadora (*Computer Vision*). 

- Toma un fotograma codificado en `Base64`.
- Aísla la estructura ósea y facial utilizando los modelos pre-entrenados **Google MediaPipe** (Pose y Face Mesh).
- Utiliza geometría básica (Cálculo de Distancia Euclidiana en 2D) para medir anchos y longitudes vitales.
- Devuelve las distancias matemáticas (`S, W, H, L, F, P, M`) requeridas por las "Reglas de Estilismo".

---

## ¿Por qué Python + FastAPI + MediaPipe?
- **Python:** Es el estándar de oro en la industria para Inteligencia Artificial y manejo de matrices nativas (`NumPy`).
- **FastAPI:** Genera microservicios que compiten en velocidad con Node.js/Go, pero que permiten ejecutar código asíncrono y bloqueante (ML) de forma extremadamente eficiente en los hilos correctos.
- **MediaPipe:** En lugar de entrenar una red neuronal desde cero para detectar hombros y cadera, se utiliza este modelo de Google que es lo suficientemente rápido para ejecutarse "On-the-fly" (en el aire) sin latencia notable.

---

## El Pilar Central: Cero Retención

El mayor reto arquitectónico fue asegurar a los usuarios que sus fotos en ropa ajustada jamás correrían el riesgo de ser robadas de nuestra base de datos. Para solucionar este pánico de ciberseguridad, el flujo de datos es:

1. El archivo `routes.py` recibe un JSON inmenso con la imagen en texto (`Base64`).
2. El string nunca se guarda como `foto.jpg`. Pasa directamente a la librería `cv2` (OpenCV) que lo convierte en una matriz de números en la memoria RAM volátil.

---

## 🚀 Guía de Ejecución

El Microservicio de IA está configurado para correr perfectamente orquestado mediante Docker, pero si estás realizando ajustes matemáticos en los algoritmos, puedes correrlo de forma nativa.

### Ejecución recomendada (vía Docker en la Raíz)
Si ejecutas `docker-compose up -d` en la carpeta raíz del repositorio, este servicio se empaquetará usando una versión liviana de Python y se expondrá en el puerto 8000 automáticamente.

### Ejecución Individual Local (Sin Docker)
Si necesitas desarrollar exclusivamente el motor de IA en Windows o Mac:

1. Abre tu terminal en esta carpeta (`ai_service`).
2. (Opcional pero muy recomendado) Crea un entorno virtual para no contaminar tu Python global:
   ```bash
   python -m venv venv
   # En Windows: venv\Scripts\activate
   # En Mac/Linux: source venv/bin/activate
   ```
3. Instala las dependencias matemáticas y de visión artificial:
   ```bash
   pip install -r requirements.txt
   ```
4. Levanta el servidor FastAPI con Uvicorn:
   ```bash
   python -m src.main
   ```
   El servidor arrancará en `http://0.0.0.0:8000`.

### 🛠 Solución de Errores Comunes
- **ImportError: libGL.so.1 cannot open shared object file:** Este es un error clásico de OpenCV en Linux/Docker. Si levantas localmente, asegúrate de usar `opencv-python-headless` (ya incluido en `requirements.txt`).
- **ModuleNotFoundError: No module named 'mediapipe':** Ocurre si instalaste las dependencias en una versión de Python incompatible (MediaPipe prefiere Python <= 3.12). Revisa tu versión con `python --version`.
- **Port 8000 is already in use:** Tienes otro servidor (probablemente otro FastAPI, Django, o aplicación web) escuchando en ese puerto. Ciérralo antes de arrancar.
3. El archivo `vision_service.py` lee esos números y extrae coordenadas clave (ej. landmark 11 de MediaPipe para el hombro izquierdo).
4. **Destrucción:** Inmediatamente al extraer las coordenadas y generar el JSON numérico, se ejecuta la directiva `del` sobre la variable de la imagen y se llama a `gc.collect()`. Esto le obliga al sistema operativo a destruir los restos de memoria RAM donde yacía la fotografía. 
5. Si un hacker penetrara el servidor, literalmente no encontraría nada más que matrices de texto numérico anonimizado.
