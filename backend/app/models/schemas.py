from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Any


class MetodoIntervaloRequest(BaseModel):
    """
    Parámetros de entrada para métodos cerrados o de intervalo (Bisección, Falsa Posición).
    """
    funcion: str = Field(
        ...,
        description="Expresión matemática de la función f(x), ej: 'x^3 - x - 2', 'cos(x) - x', 'exp(x) - 3*x'",
        examples=["x^3 - x - 2"]
    )
    a: float = Field(
        ...,
        description="Límite inferior del intervalo [a, b]",
        examples=[1.0]
    )
    b: float = Field(
        ...,
        description="Límite superior del intervalo [a, b]",
        examples=[2.0]
    )
    stop_mode: Literal["iter", "tol"] = Field(
        "tol",
        description="Modo de parada: 'iter' para iteraciones fijas o 'tol' para tolerancia basada en error relativo"
    )
    tol: float = Field(
        1e-5,
        gt=0,
        description="Tolerancia deseada para el error relativo aproximado (ej. 1e-4, 1e-5)"
    )
    max_iter: int = Field(
        100,
        ge=1,
        le=1000,
        description="Número máximo de iteraciones permitidas"
    )


class IteracionDetalle(BaseModel):
    """
    Fila individual en la tabla de iteraciones de un método numérico.
    Incluye campos en español y alias compatibles con el frontend.
    """
    iteracion: int
    a: float
    b: float
    xr: float
    f_xr: float
    ea: Optional[float] = None

    # Compatibilidad directa con el frontend existente (mathUtils.js / App.jsx)
    iteration: Optional[int] = None
    root: Optional[float] = None
    fRoot: Optional[float] = None
    error: Optional[float] = None


class MetodoResponse(BaseModel):
    """
    Respuesta estandarizada para endpoints de métodos numéricos.
    """
    exito: bool
    metodo: str
    raiz: Optional[float] = None
    f_raiz: Optional[float] = None
    iteraciones: int = 0
    error_relativo_final: Optional[float] = None
    historial: List[IteracionDetalle] = []
    mensaje: str = ""

    # Campos de conveniencia directa para el frontend
    root: Optional[float] = None
    fRoot: Optional[float] = None
    iterations: Optional[int] = None
    history: Optional[List[dict]] = None
    error: Optional[str] = None
