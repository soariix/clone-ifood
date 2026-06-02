"""
conftest.py — PyTest + Appium 2.x + UiAutomator2
App: iFood Clone (React Native / Expo) — APK Android
"""
from __future__ import annotations

import os
import time
from pathlib import Path

import pytest
import requests
from appium import webdriver
from appium.options import UiAutomator2Options
from dotenv import load_dotenv

# ─── Carrega variáveis de ambiente ───────────────────────────────────────────
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

# ─── Constantes de ambiente ──────────────────────────────────────────────────
APK_PATH: str = os.environ["APK_PATH"]  # obrigatório — falha rápido se ausente
APPIUM_URL: str = os.getenv("APPIUM_URL", "http://127.0.0.1:4723")
API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:3333")
TEST_EMAIL: str = os.getenv("TEST_EMAIL", "test@ifood.com")
TEST_PASSWORD: str = os.getenv("TEST_PASSWORD", "123456")

SCREENSHOTS_DIR = Path(__file__).parent / "reports" / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)


# ─── Fixture: driver ─────────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def driver():
    """Inicia uma sessão Appium (UiAutomator2) e encerra ao final de cada teste."""
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.app = APK_PATH

    # Comportamento recomendado: reinstala somente quando o APK mudar
    options.no_reset = False
    options.full_reset = False

    # Reduz o tempo de espera por novos comandos (ms)
    options.new_command_timeout = 120

    session = webdriver.Remote(
        command_executor=APPIUM_URL,
        options=options,
    )
    session.implicitly_wait(10)

    yield session

    session.quit()


# ─── Fixture: api_client ─────────────────────────────────────────────────────
@pytest.fixture(scope="function")
def api_client():
    """
    Autentica via POST /auth/login e devolve um objeto com:
      - token (str): Bearer JWT
      - session (requests.Session): sessão HTTP já configurada com o header Authorization
    """
    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=10,
    )
    response.raise_for_status()

    payload = response.json()
    token: str = payload["tokens"]["accessToken"]

    session = requests.Session()
    session.headers.update(
        {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
    )

    return ApiClient(token=token, session=session)


class ApiClient:
    """Wrapper leve para encapsular token e sessão HTTP autenticada."""

    def __init__(self, token: str, session: requests.Session) -> None:
        self.token = token
        self.session = session
        self.base_url = API_BASE_URL

    def get(self, path: str, **kwargs):
        return self.session.get(f"{self.base_url}{path}", **kwargs)

    def post(self, path: str, **kwargs):
        return self.session.post(f"{self.base_url}{path}", **kwargs)

    def put(self, path: str, **kwargs):
        return self.session.put(f"{self.base_url}{path}", **kwargs)

    def delete(self, path: str, **kwargs):
        return self.session.delete(f"{self.base_url}{path}", **kwargs)


# ─── Hook: screenshot automático em falhas ───────────────────────────────────
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call):
    """Captura screenshot quando um teste falha (fase 'call')."""
    outcome = yield
    report = outcome.get_result()

    if report.when == "call" and report.failed:
        driver_fixture = item.funcargs.get("driver")
        if driver_fixture is None:
            return

        timestamp = time.strftime("%Y%m%d-%H%M%S")
        safe_name = item.nodeid.replace(
            "/", "_").replace("::", "__").replace(" ", "_")
        screenshot_path = SCREENSHOTS_DIR / f"{timestamp}__{safe_name}.png"

        try:
            driver_fixture.save_screenshot(str(screenshot_path))
            # Anexa o caminho ao relatório para que plugins como pytest-html o exibam
            report.extra = getattr(report, "extra", [])
            report.extra.append(
                {"name": "screenshot", "content": str(
                    screenshot_path), "mime_type": "image/png"}
            )
        except Exception as exc:  # noqa: BLE001
            print(f"\n[conftest] Falha ao capturar screenshot: {exc}")
