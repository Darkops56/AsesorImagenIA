import base64
import gc
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.vision_service import procesar_fotograma

router = APIRouter()

class FrameRequest(BaseModel):
    image_base64: str

@router.post("/process-frame")
def process_frame(request: FrameRequest):
    """
    Recibe un fotograma en formato Base64.
    Lo procesa en memoria (RAM) para extraer las coordenadas morfológicas,
    y destruye la imagen inmediatamente para cumplir con la política de privacidad.
    """
    image_np = None
    try:
        # Extraer datos si contiene prefijo "data:image/jpeg;base64,"
        base64_str = request.image_base64
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]

        # 1. Decodificar Base64 a NumPy en memoria RAM (Sin tocar el disco)
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        image_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_np is None:
            raise ValueError("No se pudo decodificar la imagen.")

        # 2. Procesar con MediaPipe (Extraer S, W, H, L, F, P, M)
        resultado = procesar_fotograma(image_np)

        if resultado["error"]:
            if "quality_metrics" in resultado:
                return {
                    "status": "quality_error",
                    "message": resultado["error"],
                    "metrics": resultado["quality_metrics"]
                }
            return {
                "error": resultado["error"]
            }

        # Retornar únicamente el JSON estadístico
        return {
            "status": "success",
            "data": resultado
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando la imagen: {str(e)}")

    finally:
        # 3. POLÍTICA DE CERO RETENCIÓN (Destrucción forzada)
        if image_np is not None:
            del image_np
        if 'img_bytes' in locals():
            del img_bytes
        if 'nparr' in locals():
            del nparr
        
        # Forzamos la recolección de basura de Python
        gc.collect()
