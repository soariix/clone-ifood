"""
tests/smoke/test_login.py
Testes de fumaça para a tela de login do iFood Clone.
"""
from __future__ import annotations

import allure
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from tests.pages.login_page import LoginPage

# ─── Credenciais de teste ─────────────────────────────────────────────────────
VALID_EMAIL = "test@ifood.com"
VALID_PASSWORD = "123456"

# ─── Marker de suíte ─────────────────────────────────────────────────────────
pytestmark = pytest.mark.smoke


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _wait_for(driver, locator, timeout: int = 10):
    """Aguarda visibilidade de um elemento e o retorna."""
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located(locator)
    )


# ─── Testes ───────────────────────────────────────────────────────────────────

@allure.title("Login válido — home deve carregar")
@allure.description(
    "Preenche e-mail e senha corretos e verifica que a tela principal "
    "(home-screen) se torna visível após o login."
)
def test_login_valido(driver):
    page = LoginPage(driver)

    with allure.step("Preencher credenciais válidas e tocar em Entrar"):
        page.login(VALID_EMAIL, VALID_PASSWORD)

    with allure.step("Verificar que a tela Home carregou"):
        home = _wait_for(driver, (AppiumBy.ACCESSIBILITY_ID, "home-screen"))
        assert home.is_displayed(), "A tela Home não ficou visível após login válido."


@allure.title("Login com senha errada — mensagem de erro deve aparecer")
@allure.description(
    "Tenta login com e-mail válido mas senha incorreta e confirma que a "
    "mensagem de erro é exibida na tela."
)
def test_login_senha_errada(driver):
    page = LoginPage(driver)

    with allure.step("Preencher e-mail válido e senha incorreta"):
        page.login(VALID_EMAIL, "senha_errada")

    with allure.step("Verificar mensagem de erro"):
        error_text = page.get_error_message()
        assert error_text, "Nenhuma mensagem de erro foi exibida."
        assert any(
            word in error_text.lower()
            for word in ("incorretos", "inválid", "erro", "invalid", "wrong")
        ), f"Mensagem de erro inesperada: '{error_text}'"


@allure.title("Login com entrada inválida — validação deve bloquear envio")
@allure.description(
    "Verifica que o formulário impede o envio quando os campos estão "
    "vazios ou contêm um e-mail mal formatado (sem @)."
)
@pytest.mark.parametrize(
    "email, password, test_id",
    [
        ("",            "",       "campos_vazios"),
        ("emailsemarroba", "",    "email_sem_arroba_senha_vazia"),
        ("emailsemarroba", VALID_PASSWORD, "email_sem_arroba_senha_valida"),
        ("",            VALID_PASSWORD, "email_vazio_senha_valida"),
    ],
    ids=lambda v: v if isinstance(v, str) else "",
)
def test_login_campos_invalidos(driver, email: str, password: str, test_id: str):
    page = LoginPage(driver)

    with allure.step(f"[{test_id}] Preencher email='{email}' e password='{password}'"):
        if email:
            page.fill_email(email)
        if password:
            page.fill_password(password)
        page.tap_login()

    with allure.step(f"[{test_id}] Verificar que a home NÃO carregou"):
        # O app não deve navegar para a home — o elemento home-screen não deve aparecer
        home_elements = driver.find_elements(
            AppiumBy.ACCESSIBILITY_ID, "home-screen")
        assert not home_elements or not home_elements[0].is_displayed(), (
            f"[{test_id}] App navegou para a home com entrada inválida."
        )

    with allure.step(f"[{test_id}] Verificar que mensagem de erro ou campo inválido é exibido"):
        # Aceita mensagem de erro global OU validação inline nos campos
        error_elements = driver.find_elements(
            AppiumBy.ACCESSIBILITY_ID, "error-message")
        has_global_error = bool(
            error_elements and error_elements[0].is_displayed())

        # Validação inline de e-mail (accessibility_id convencional do RN)
        email_error_elements = driver.find_elements(
            AppiumBy.ACCESSIBILITY_ID, "email-error")
        has_inline_error = bool(
            email_error_elements and email_error_elements[0].is_displayed())

        assert has_global_error or has_inline_error, (
            f"[{test_id}] Nenhum feedback de validação foi exibido para entrada inválida."
        )
