"""
User serializers.

Read vs write serializers are kept separate so sensitive fields (password,
phone_number) are never accidentally echoed back in the wrong context.

phone_number validation is defined once on the model field via RegexValidator;
DRF inherits it automatically when the field is not explicitly declared here.
"""

from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import User


class UserReadSerializer(serializers.ModelSerializer):
    """Safe, read-only snapshot returned to clients after any write operation."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "is_staff",
            "created_at",
        ]
        read_only_fields = fields


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Registration payload.
    Writes password (hashed), never returns it.
    phone_number is optional — omit or pass "" to skip.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "password",
            "password_confirm",
        ]

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Partial profile update — only name fields and phone_number are editable.
    Email and password are deliberately excluded; each has its own endpoint.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number"]


class ChangePasswordSerializer(serializers.Serializer):
    """Validates current password before allowing a new one to be set."""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs: dict) -> dict:
        if attrs["new_password"] != attrs.pop("new_password_confirm"):
            raise serializers.ValidationError(
                {"new_password": "New passwords do not match."}
            )
        return attrs

    def validate_current_password(self, value: str) -> str:
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
