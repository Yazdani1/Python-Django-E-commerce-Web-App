"""
Project-wide utility functions.
Add pure helper functions here; keep them side-effect-free.
"""

from django.shortcuts import get_object_or_404


def get_object_or_404_with_message(model, message: str = None, **kwargs):
    """
    Thin wrapper around get_object_or_404 that lets callers set a custom
    404 message without repeating try/except blocks.
    """
    from rest_framework.exceptions import NotFound

    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        raise NotFound(detail=message or f"{model.__name__} not found.")
