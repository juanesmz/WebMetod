from fastapi import APIRouter, HTTPException, status
from app.models.schemas import MetodoIntervaloRequest, MetodoResponse, IteracionDetalle
from app.utils.parser import get_math_function


router = APIRouter(prefix="", tags=["Método de Falsa Posición"])


@router.post(
    "/falsa-posicion",
    response_model=MetodoResponse,
    summary="Resolver por el Método de Falsa Posición (Regula Falsi)",
    description="Calcula la raíz de f(x) = 0 usando el método de Falsa Posición con historial paso a paso y criterio de parada por iteraciones fijas o error relativo."
)
def resolver_falsa_posicion(req: MetodoIntervaloRequest):
    """
    Endpoint dedicado exclusivamente al Método de Falsa Posición.
    """
    # 1. Interpretar la función matemática
    try:
        f = get_math_function(req.funcion)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en la función ingresada: {str(e)}"
        )

    # 2. Evaluar f(a) y f(b)
    try:
        fa = f(req.a)
        fb = f(req.b)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo evaluar la función en los extremos: {str(e)}"
        )

    # Casos inmediatos donde un extremo ya es raíz
    if fa == 0.0:
        detalle = IteracionDetalle(
            iteracion=1, a=req.a, b=req.b, xr=req.a, f_xr=0.0, ea=0.0,
            iteration=1, root=req.a, fRoot=0.0, error=0.0
        )
        return MetodoResponse(
            exito=True,
            metodo="Falsa Posición",
            raiz=req.a,
            f_raiz=0.0,
            iteraciones=1,
            error_relativo_final=0.0,
            historial=[detalle],
            mensaje="El límite inferior 'a' ya es una raíz exacta de la función.",
            root=req.a,
            fRoot=0.0,
            iterations=1,
            history=[detalle.model_dump()],
            error=None
        )

    if fb == 0.0:
        detalle = IteracionDetalle(
            iteracion=1, a=req.a, b=req.b, xr=req.b, f_xr=0.0, ea=0.0,
            iteration=1, root=req.b, fRoot=0.0, error=0.0
        )
        return MetodoResponse(
            exito=True,
            metodo="Falsa Posición",
            raiz=req.b,
            f_raiz=0.0,
            iteraciones=1,
            error_relativo_final=0.0,
            historial=[detalle],
            mensaje="El límite superior 'b' ya es una raíz exacta de la función.",
            root=req.b,
            fRoot=0.0,
            iterations=1,
            history=[detalle.model_dump()],
            error=None
        )

    # 3. Verificación del Teorema de Bolzano
    if fa * fb > 0:
        msg = f"f(a)={fa:.5f} y f(b)={fb:.5f} tienen el mismo signo. No se garantiza una raíz en el intervalo [{req.a}, {req.b}] según el teorema de Bolzano."
        return MetodoResponse(
            exito=False,
            metodo="Falsa Posición",
            raiz=None,
            f_raiz=None,
            iteraciones=0,
            error_relativo_final=None,
            historial=[],
            mensaje=msg,
            root=None,
            fRoot=None,
            iterations=0,
            history=[],
            error=msg
        )

    # 4. Iteración del método de Falsa Posición
    historial = []
    a = float(req.a)
    b = float(req.b)
    f_a = fa
    f_b = fb
    xr = 0.0
    xr_anterior = 0.0
    ea_final = None

    for i in range(1, req.max_iter + 1):
        denominador = f_b - f_a
        if denominador == 0.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"División por cero en el cálculo de la falsa posición: f(b) y f(a) son iguales en la iteración {i}."
            )

        xr = b - (f_b * (b - a)) / denominador

        try:
            f_xr = f(xr)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al evaluar la función en xr = {xr} (Iteración {i}): {str(e)}"
            )

        # Cálculo de error relativo aproximado (a partir de la iteración 2)
        if i > 1:
            ea = abs((xr - xr_anterior) / xr) if xr != 0 else abs(xr - xr_anterior)
        else:
            ea = None

        ea_final = ea

        detalle = IteracionDetalle(
            iteracion=i,
            a=a,
            b=b,
            xr=xr,
            f_xr=f_xr,
            ea=ea,
            iteration=i,
            root=xr,
            fRoot=f_xr,
            error=ea
        )
        historial.append(detalle)

        # Criterio de parada
        if f_xr == 0.0 or (req.stop_mode == "tol" and ea is not None and ea < req.tol):
            break

        if i == req.max_iter and req.stop_mode == "iter":
            break

        # Cambio de subintervalo
        if f_a * f_xr < 0:
            b = xr
            f_b = f_xr
        else:
            a = xr
            f_a = f_xr

        xr_anterior = xr

    f_final = f(xr)

    return MetodoResponse(
        exito=True,
        metodo="Falsa Posición",
        raiz=xr,
        f_raiz=f_final,
        iteraciones=len(historial),
        error_relativo_final=ea_final,
        historial=historial,
        mensaje="Convergencia alcanzada exitosamente." if (ea_final is not None and req.stop_mode == 'tol' and ea_final < req.tol) or f_final == 0.0 else f"Finalizado tras {len(historial)} iteraciones.",
        root=xr,
        fRoot=f_final,
        iterations=len(historial),
        history=[row.model_dump() for row in historial],
        error=None
    )
