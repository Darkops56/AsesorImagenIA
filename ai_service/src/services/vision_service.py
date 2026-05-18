import gc
import math
import cv2
import numpy as np
import mediapipe as mp

# Inicializar modelos de MediaPipe estáticamente para no recargarlos en cada request
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=True, 
    model_complexity=2, 
    enable_segmentation=True, 
    min_detection_confidence=0.5
)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1, 
    refine_landmarks=True, 
    min_detection_confidence=0.5
)

def calcular_distancia(p1, p2):
    """Calcula la distancia Euclidiana 2D entre dos puntos normalizados (x, y)."""
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)

def validar_calidad_imagen(image_np: np.ndarray) -> dict:
    """
    Evalúa la nitidez (desenfoque) y la iluminación de la imagen.
    Umbrales basados en mejores prácticas para MediaPipe.
    """
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    
    # 1. Nitidez (Varianza del Laplaciano)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_sharp = laplacian_var > 100.0  # Umbral de borrosidad

    # 2. Iluminación (Brillo promedio)
    brightness = gray.mean()
    is_well_lit = 40.0 < brightness < 230.0  # Evitar muy oscuro o muy sobreexpuesto

    return {
        "is_valid": is_sharp and is_well_lit,
        "is_sharp": is_sharp,
        "is_well_lit": is_well_lit,
        "laplacian_var": round(laplacian_var, 2),
        "brightness": round(brightness, 2),
        "reason": "La imagen está muy borrosa." if not is_sharp else ("La iluminación no es adecuada (muy oscura o muy brillante)." if not is_well_lit else None)
    }


def procesar_fotograma(image_np: np.ndarray) -> dict:
    """
    Recibe una imagen decodificada como array de NumPy (BGR).
    Procesa Pose y Face Mesh y devuelve las medidas solicitadas.
    """
    resultados = {
        "morfologia_corporal": {"S": None, "W": None, "H": None},
        "morfologia_facial": {"L": None, "F": None, "P": None, "M": None},
        "error": None
    }

    try:
        # Validación de Calidad
        calidad = validar_calidad_imagen(image_np)
        if not calidad["is_valid"]:
            resultados["error"] = calidad["reason"]
            resultados["quality_metrics"] = calidad
            return resultados

        # Convertir a RGB (requerido por MediaPipe)
        image_rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)

        # 1. Procesamiento Corporal (Pose)
        pose_results = pose.process(image_rgb)
        if pose_results.pose_landmarks:
            landmarks = pose_results.pose_landmarks.landmark
            
            # S: Distancia entre Hombros (11 y 12)
            s_dist = calcular_distancia(landmarks[11], landmarks[12])
            
            # H: Distancia entre Caderas (23 y 24)
            h_dist = calcular_distancia(landmarks[23], landmarks[24])
            
            # W: Cintura (No hay puntos exactos en MediaPipe, se estima)
            # En un entorno real se usaría la segmentación (pose_results.segmentation_mask)
            # Para este MVP matemático, se asume un punto intermedio entre hombro y cadera.
            w_dist = s_dist * 0.8  # Placeholder lógico. En prod se calcula el contorno sobre la máscara.
            
            resultados["morfologia_corporal"] = {
                "S": round(s_dist, 4),
                "W": round(w_dist, 4),
                "H": round(h_dist, 4)
            }

        # 2. Procesamiento Facial (Face Mesh)
        face_results = face_mesh.process(image_rgb)
        if face_results.multi_face_landmarks:
            face_lms = face_results.multi_face_landmarks[0].landmark
            
            # L: Longitud (10 a 152)
            l_dist = calcular_distancia(face_lms[10], face_lms[152])
            
            # F: Frente (21 a 251)
            f_dist = calcular_distancia(face_lms[21], face_lms[251])
            
            # P: Pómulos (234 a 454)
            p_dist = calcular_distancia(face_lms[234], face_lms[454])
            
            # M: Mandíbula (132 a 361)
            m_dist = calcular_distancia(face_lms[132], face_lms[361])

            resultados["morfologia_facial"] = {
                "L": round(l_dist, 4),
                "F": round(f_dist, 4),
                "P": round(p_dist, 4),
                "M": round(m_dist, 4)
            }

    except Exception as e:
        resultados["error"] = str(e)
    
    finally:
        # CERO RETENCIÓN: Destruimos las variables pesadas explícitamente en RAM
        if 'image_rgb' in locals():
            del image_rgb
        gc.collect()

    return resultados
