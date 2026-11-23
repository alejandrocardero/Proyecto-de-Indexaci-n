"""Fixtures compartidas: evita que el rate limit de una prueba afecte a otra."""

import pytest

from app.core.rate_limit import reset_rate_limits


@pytest.fixture(autouse=True)
def _limpio_rate_limit():
    reset_rate_limits()
    yield
    reset_rate_limits()
