# Backend de Métodos Numéricos (FastAPI)

Este backend está diseñado y estructurado bajo una arquitectura modular en **FastAPI**, donde **cada endpoint está dedicado única y exclusivamente a un solo método numérico**.

---

## 📁 Estructura del Proyecto

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Configuración de FastAPI, CORS y registro de routers
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py           # Modelos Pydantic (Request, Response, Iteración)
│   ├── utils/
│   │   ├── __init__.py
│   │   └── parser.py            # Parser matemático seguro con SymPy
│   └── routers/
│       ├── __init__.py
│       ├── biseccion.py         # Endpoint dedicado al Método de Bisección
│       └── falsa_posicion.py    # Endpoint dedicado al Método de Falsa Posición
├── tests/
│   └── test_api.py              # Suite de pruebas unitarias y de integración
├── requirements.txt             # Dependencias del proyecto
├── run.py                       # Script para iniciar el servidor
└── README.md
```

---

## 🚀 Requisitos e Instalación

1. Asegúrate de tener Python 3.10+ instalado.
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

---

## ▶️ Ejecución del Servidor

Para iniciar el servidor en modo desarrollo (con auto-recarga):

```bash
python run.py
```

O directamente con `uvicorn`:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Una vez iniciado:
- **API Base:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Documentación Interactiva (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Documentación ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📌 Endpoints Disponibles

### 1. Método de Bisección
- **Ruta:** `POST /api/metodos/biseccion`
- **Descripción:** Encuentra raíces de ecuaciones continuas mediante bisección sucesiva de intervalos con cambio de signo (Teorema de Bolzano).

### 2. Método de Falsa Posición (Regula Falsi)
- **Ruta:** `POST /api/metodos/falsa-posicion`
- **Descripción:** Encuentra raíces trazando rectas secantes entre los extremos del intervalo.

---

## 📬 Formato de Petición (Request Body)

```json
{
  "funcion": "x^3 - x - 2",
  "a": 1.0,
  "b": 2.0,
  "stop_mode": "tol",
  "tol": 0.0001,
  "max_iter": 100
}
```

- `funcion`: Cadena con la expresión matemática (soporta `^`, potencias, `cos(x)`, `sin(x)`, `exp(x)`, `ln(x)`, `3x`, etc.).
- `a`: Límite inferior del intervalo.
- `b`: Límite superior del intervalo.
- `stop_mode`: `"tol"` para detenerse por error relativo o `"iter"` para número fijo de iteraciones.
- `tol`: Tolerancia deseada para el error relativo aproximado.
- `max_iter`: Límite máximo de iteraciones.

---

## 📤 Formato de Respuesta (Response Body)

```json
{
  "exito": true,
  "metodo": "Bisección",
  "raiz": 1.5213623046875,
  "f_raiz": -0.00010486,
  "iteraciones": 13,
  "error_relativo_final": 0.00006,
  "historial": [
    {
      "iteracion": 1,
      "a": 1.0,
      "b": 2.0,
      "xr": 1.5,
      "f_xr": -0.125,
      "ea": null
    },
    {
      "iteracion": 2,
      "a": 1.5,
      "b": 2.0,
      "xr": 1.75,
      "f_xr": 1.609375,
      "ea": 0.142857
    }
  ],
  "mensaje": "Convergencia alcanzada exitosamente."
}
```

---

## 🧪 Pruebas Automatizadas

Para ejecutar las pruebas:
```bash
python tests/test_api.py
```
