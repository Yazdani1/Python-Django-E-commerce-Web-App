"""
ViewSet/View mixins shared across the project.
Extract repeated view behaviour here to keep individual views lean.
"""

from rest_framework.response import Response


class SuccessResponseMixin:
    """
    Provides a helper to return a consistent success envelope:
    {success: true, message: str, data: any}
    """

    def success_response(
        self,
        data: dict | list | None = None,
        message: str = "Success",
        status_code: int = 200,
    ) -> Response:
        return Response(
            {"success": True, "message": message, "data": data},
            status=status_code,
        )
