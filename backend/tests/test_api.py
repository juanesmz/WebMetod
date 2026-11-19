from fastapi.testclient import TestClient
import sys
import os

# Asegurar que el path incluya la carpeta backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["estado"] == "activo"
    assert len(data["endpoints_disponibles"]) == 2
    print("[OK] test_root")


def test_biseccion_convergencia():
    payload = {
        "funcion": "x^3 - x - 2",
        "a": 1.0,
        "b": 2.0,
        "stop_mode": "tol",
        "tol": 1e-4,
        "max_iter": 50
    }
    response = client.post("/api/metodos/biseccion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert data["metodo"] == "Bisección"
    assert data["raiz"] is not None
    # Raíz aproximada de x^3 - x - 2 es 1.52138
    assert abs(data["raiz"] - 1.52138) < 1e-3
    assert len(data["historial"]) > 0
    print(f"[OK] test_biseccion_convergencia (raiz: {data['raiz']}, iteraciones: {data['iteraciones']})")


def test_biseccion_bolzano_mismo_signo():
    payload = {
        "funcion": "x^2 + 1",
        "a": 1.0,
        "b": 2.0,
        "stop_mode": "iter",
        "tol": 1e-4,
        "max_iter": 10
    }
    response = client.post("/api/metodos/biseccion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is False
    assert "teorema de Bolzano" in data["mensaje"]
    print("[OK] test_biseccion_bolzano_mismo_signo")


def test_falsa_posicion_convergencia():
    payload = {
        "funcion": "cos(x) - x",
        "a": 0.0,
        "b": 1.0,
        "stop_mode": "tol",
        "tol": 1e-5,
        "max_iter": 50
    }
    response = client.post("/api/metodos/falsa-posicion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert data["metodo"] == "Falsa Posición"
    # Raíz aproximada de cos(x) - x es 0.739085
    assert abs(data["raiz"] - 0.739085) < 1e-3
    assert len(data["historial"]) > 0
    print(f"[OK] test_falsa_posicion_convergencia (raiz: {data['raiz']}, iteraciones: {data['iteraciones']})")


def test_expresion_trigonometrica_y_exponencial():
    payload = {
        "funcion": "exp(x) - 3*x",
        "a": 0.0,
        "b": 1.0,
        "stop_mode": "iter",
        "tol": 1e-5,
        "max_iter": 15
    }
    response = client.post("/api/metodos/biseccion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["exito"] is True
    assert abs(data["raiz"] - 0.6190) < 1e-2
    print("[OK] test_expresion_trigonometrica_y_exponencial")


def test_sintaxis_invalida():
    payload = {
        "funcion": "x^^^3 - ???",
        "a": 0.0,
        "b": 1.0,
        "stop_mode": "iter",
        "tol": 1e-5,
        "max_iter": 10
    }
    response = client.post("/api/metodos/biseccion", json=payload)
    assert response.status_code == 400
    assert "Error en la función ingresada" in response.json()["detail"]
    print("[OK] test_sintaxis_invalida")


if __name__ == "__main__":
    test_root()
    test_biseccion_convergencia()
    test_biseccion_bolzano_mismo_signo()
    test_falsa_posicion_convergencia()
    test_expresion_trigonometrica_y_exponencial()
    test_sintaxis_invalida()
    print("\nTODAS LAS PRUEBAS PASARON EXITOSAMENTE!")
