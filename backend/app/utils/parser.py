import re
import math
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)
from typing import Callable


TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)


def preprocess_expression(expr_str: str) -> str:
    """
    Normaliza la sintaxis de la expresión matemática de entrada.
    Soporta notaciones comunes:
      - e^x o e^(2*x) -> exp(x) o exp(2*x)
      - ln(x) -> log(x)
      - Potencias con ^ (se transforman a **)
    """
    clean = expr_str.strip()
    if not clean:
        raise ValueError("La expresión matemática no puede estar vacía.")

    # Reemplazo de e^... por exp(...)
    clean = re.sub(r'\be\^([a-zA-Z0-9_]+)', r'exp(\1)', clean)
    clean = re.sub(r'\be\^(\([^)]+\))', r'exp\1', clean)

    # Reemplazo de ln por log (en sympy, log es logaritmo natural)
    clean = re.sub(r'\bln\b', 'log', clean)

    return clean


def get_math_function(expr_str: str) -> Callable[[float], float]:
    """
    Convierte una cadena de texto en una función matemática invocable f(x).
    Usa SymPy para un análisis sintáctico seguro y lambdify para alta velocidad numérica.
    """
    cleaned = preprocess_expression(expr_str)
    x = sp.Symbol('x')

    try:
        parsed_expr = parse_expr(cleaned, transformations=TRANSFORMATIONS)
    except Exception as e:
        raise ValueError(f"Error al interpretar la expresión matemática '{expr_str}': {str(e)}")

    # Validar que los símbolos presentes sean únicamente 'x'
    symbols = parsed_expr.free_symbols
    for s in symbols:
        if s.name != 'x':
            raise ValueError(f"La variable '{s.name}' no está reconocida. Únicamente se permite la variable 'x'.")

    # Compilar a función numérica
    lambdified = sp.lambdify(x, parsed_expr, modules=['numpy', 'math'])

    def evaluator(val: float) -> float:
        try:
            res = lambdified(val)
            # Manejar escalares o arrays unitarios de numpy
            if isinstance(res, np.ndarray):
                res = res.item()
            if isinstance(res, complex):
                if abs(res.imag) > 1e-12:
                    raise ValueError(f"La función generó un valor complejo ({res}) en x = {val}")
                res = res.real
            res = float(res)
            if math.isnan(res):
                raise ValueError(f"La función produjo NaN (indefinición) en x = {val}")
            if math.isinf(res):
                raise ValueError(f"La función produjo infinito (asíntota) en x = {val}")
            return res
        except ZeroDivisionError:
            raise ValueError(f"División entre cero al evaluar f({val})")
        except OverflowError:
            raise ValueError(f"Desbordamiento numérico (Overflow) al evaluar f({val})")
        except Exception as e:
            if isinstance(e, ValueError):
                raise e
            raise ValueError(f"No se pudo evaluar f({val}): {str(e)}")

    return evaluator
