# Relevamiento Técnico: Sistema de Asesoría de Imagen Inteligente

Este documento consolida la arquitectura, lógica de negocio, protocolos de seguridad y diseño de experiencia para el desarrollo de la aplicación de asesoría de moda automatizada.

---

## 1. Arquitectura del Sistema
El sistema se basa en una arquitectura de microservicios para garantizar escalabilidad y separación de responsabilidades.

* **Frontend (Mobile):** React Native (iOS / Android).
* **Backend (Core):** API REST en Node.js (Express) o .NET (C#).
* **Microservicio de IA:** Python (FastAPI) con Google MediaPipe o YOLO-Pose.
* **Base de Datos:** MongoDB (NoSQL) para flexibilidad de atributos.

---

## 2. Modelado Matemático (Morfología)

### 2.1 Morfología Corporal
Se utilizan tres variables de entrada: **S** (Shoulders), **W** (Waist), **H** (Hips).

| Silueta | Regla Matemática | Estrategia de Estilismo |
| :--- | :--- | :--- |
| **Triángulo (Pera)** | `H > S * 1.05` | Volumen superior, colores oscuros abajo. |
| **Triángulo Invertido** | `S > H * 1.05` | Volumen inferior, cuellos en V. |
| **Reloj de Arena** | `S ≈ H` y `W ≤ S * 0.75` | Prendas entalladas, marcar cintura. |
| **Rectángulo** | `S ≈ H` y `W > S * 0.75` | Crear ilusión de curvas, cinturones. |
| **Óvalo (Manzana)** | `W > S` y `W > H` | Corte imperio, líneas verticales. |

### 2.2 Visagismo (Rostro)
* **Ovalado:** `Longitud (L) ≈ 1.5 * Pómulos (P)`.
* **Redondo:** `L ≈ P`. Requiere cuellos en V para alargar visualmente.

---

## 3. Protocolo de Captura y QA (Testing)

### 3.1 Filtros de Prevención en Tiempo Real
* **Iluminación:** Validación de exposición para evitar contraluz o subexposición.
* **Estabilidad:** Uso del giroscopio para evitar *motion blur* (fotos borrosas).
* **Segmentación:** Uso de MediaPipe para aislar la silueta y teñir el fondo de un color sólido.

### 3.2 Reglas de Indumentaria
* **Ropa Ligera:** Telas finas que no alteren el contorno real.
* **No Oversize:** Las prendas no deben doblar el ancho real del torso.
* **Landmarks:** Puntos clave (hombros, cadera) deben estar despejados para la detección.

---

## 4. Base de Datos MongoDB y Feedback Loop

### 4.1 Esquema de Colecciones
* **`Usuarios`:** Perfil y medidas morfométricas.
* **`Prendas`:** Catálogo con atributos (cuello, corte, material).
* **`Interacciones`:** Registro de *Swipes* (Likes/Dislikes) y tiempo de vista.
* **`Combinaciones`:** Outfits generados por la fusión de estilos de interés.
* **`Estilos_Config`:** Diccionario de reglas por estilo (ej. Grunge, Minimalista).

### 4.2 Lógica de Aprendizaje
* **Feedback Implícito:** Si el tiempo de vista es alto, se asocia interés y se recomiendan estilos similares.
* **Flexibilidad:** El usuario puede elegir prendas fuera de su recomendación técnica. El sistema avisará discretamente: *"¡Nos encanta este estilo! Se aleja un poco de lo ideal para tu silueta, pero la confianza es lo que importa"*.

---

## 5. Diseño UI/UX y Flujos

### Flujo 1: Onboarding
* Tutorial visual sobre ropa permitida/prohibida.
* Aviso de privacidad sobre procesamiento efímero de fotos.

### Flujo 2: Cámara Asistida
* **Overlay:** Silueta guía para encuadre.
* **Semáforo:** Indicadores verdes/rojos de luz y estabilidad.

### Flujo 3: Discovery Feed
* **Interfaz Swipe:** Derecha (Me gusta), Izquierda (Pasar).
* **Ghost Icons:** Iconos de baja opacidad (Corazón/X) para guiar el movimiento.
* **Tutorial FTUE:** Capa inicial que explica los gestos al primer uso.

---

## 6. Seguridad y Privacidad

### 6.1 Política de "Cero Retención"
* Las imágenes se procesan en la RAM del servidor de IA y se destruyen de inmediato.
* Solo se guardan las coordenadas numéricas anónimas.

### 6.2 Ciberseguridad
* **Cifrado:** Argon2id/Bcrypt para contraseñas; JWT para sesiones.
* **Blindaje:** SSL Pinning en la App y prevención de NoSQL Injection en el Backend.
* **Autenticación Biométrica:** Uso de FaceID/TouchID local (Keychain/Keystore) para accesos rápidos post-login sin reingresar contraseña.