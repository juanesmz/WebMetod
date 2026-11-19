from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import biseccion_router, falsa_posicion_router


app = FastAPI(
    title="API de Métodos Numéricos",
    description="Backend en FastAPI con endpoints dedicados individualmente a cada método numérico.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = [
    "https://frontend-kappa-six-bxra2n7gon.vercel.app",
    "https://frontend-3gmx5ur0b-juanes01062000-7753.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Configuración de CORS para permitir la comunicación con el frontend en Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de cada router dedicado a un solo método numérico
app.include_router(biseccion_router, prefix="/api/metodos")
app.include_router(falsa_posicion_router, prefix="/api/metodos")


@app.get("/", tags=["General"])
def root():
    """
    Información general y estado de la API.
    """
    return {
        "nombre": "API de Métodos Numéricos",
        "estado": "activo",
        "documentacion": "/docs",
        "endpoints_disponibles": [
            {
                "metodo": "POST",
                "ruta": "/api/metodos/biseccion",
                "descripcion": "Método de Bisección"
            },
            {
                "metodo": "POST",
                "ruta": "/api/metodos/falsa-posicion",
                "descripcion": "Método de Falsa Posición (Regula Falsi)"
            }
        ]
    }
