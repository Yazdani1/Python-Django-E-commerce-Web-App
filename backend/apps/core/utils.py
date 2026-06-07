"""
Project-wide utility functions.
Add pure helper functions here; keep them side-effect-free.
"""


def get_object_or_404_with_message(model, message: str = None, **kwargs):
    from rest_framework.exceptions import NotFound

    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        raise NotFound(detail=message or f"{model.__name__} not found.")
