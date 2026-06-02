"""login_page.py — Page Object para a tela de login do iFood Clone."""
from __future__ import annotations

from appium.webdriver.common.appiumby import AppiumBy
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from .base_page import BasePage


class LoginPage(BasePage):
    """Encapsula todas as interações com a tela de login."""

    # ─── Locators ────────────────────────────────────────────────────────────
    _EMAIL_INPUT = (AppiumBy.ACCESSIBILITY_ID, "email-input")
    _PASSWORD_INPUT = (AppiumBy.ACCESSIBILITY_ID, "password-input")
    _LOGIN_BUTTON = (AppiumBy.ACCESSIBILITY_ID, "login-button")
    _ERROR_MESSAGE = (AppiumBy.ACCESSIBILITY_ID, "error-message")

    def __init__(self, driver: WebDriver) -> None:
        super().__init__(driver)

    # ─── Ações individuais ────────────────────────────────────────────────────
    def fill_email(self, email: str) -> None:
        """Preenche o campo de e-mail."""
        element = self.wait_for_element(self._EMAIL_INPUT)
        element.clear()
        element.send_keys(email)

    def fill_password(self, password: str) -> None:
        """Preenche o campo de senha."""
        element = self.wait_for_element(self._PASSWORD_INPUT)
        element.clear()
        element.send_keys(password)

    def tap_login(self) -> None:
        """Toca no botão de entrar."""
        self.wait_for_element(self._LOGIN_BUTTON).click()

    def get_error_message(self) -> str:
        """
        Aguarda o texto de erro aparecer e retorna seu conteúdo.

        Usa ``visibility_of_element_located`` para garantir que o elemento
        esteja visível (não apenas presente no DOM).
        """
        element = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(self._ERROR_MESSAGE)
        )
        return element.text

    # ─── Ação composta ───────────────────────────────────────────────────────
    def login(self, email: str, password: str) -> None:
        """Preenche e-mail, senha e toca no botão de entrar em sequência."""
        self.fill_email(email)
        self.fill_password(password)
        self.tap_login()
