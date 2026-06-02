"""base_page.py — Classe base para todos os Page Objects."""
from __future__ import annotations

from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    """Fornece utilitários comuns a todas as páginas."""

    def __init__(self, driver: WebDriver) -> None:
        self.driver = driver

    def wait_for_element(self, locator: tuple, timeout: int = 10):
        """
        Aguarda até ``timeout`` segundos pelo elemento identificado por ``locator``.

        :param locator: tupla (By.<strategy>, value) compatível com Selenium/Appium.
        :param timeout: tempo máximo de espera em segundos.
        :returns: WebElement encontrado.
        :raises TimeoutException: se o elemento não aparecer dentro do prazo.
        """
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )
