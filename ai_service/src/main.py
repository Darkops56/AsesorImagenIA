from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router as vision_router

app = FastAPI(
    title="AsesorImagenIA - Microservicio de Visión",
    description="Procesa imágenes en memoria RAM para extraer landmarks de MediaPipe.",
    version="1.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción limitar al Backend Node.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Rutas
app.include_router(vision_router, prefix="/api/vision", tags=["Vision"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Microservicio IA activo y seguro"}

# Punto de entrada para desarrollo local
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
