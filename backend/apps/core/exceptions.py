"""
Custom exception handler and application-level exception classes.
Registered in settings.REST_FRAMEWORK["EXCEPTION_HANDLER"].
"""

from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """Wrap DRF errors in a consistent {success, message, errors} envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            "success": False,
            "message": _extract_message(response.data),
            "errors": response.data,
        }

    return response


def _extract_message(data: dict | list | str) -> str:
    """Pull a human-readable summary from DRF error data."""
    if isinstance(data, str):
        return data
    if isinstance(data, list) and data:
        return str(data[0])
    if isinstance(data, dict):
        first_value = next(iter(data.values()), "An error occurred.")
        if isinstance(first_value, list):
            return str(first_value[0])
        return str(first_value)
    return "An error occurred."
