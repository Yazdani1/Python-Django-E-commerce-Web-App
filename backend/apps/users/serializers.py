"""
User serializers.
Split into read (safe) and write (mutating) serializers to avoid
accidentally exposing sensitive fields in responses.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserReadSerializer(serializers.ModelSerializer):
    """Safe read-only representation returned to clients."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "created_at"]
        read_only_fields = fields


class UserCreateSerializer(serializers.ModelSerializer):
    """Used only for registration — writes password, never returns it."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password", "password_confirm"]

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    """Allows partial profile updates — email and password are excluded."""

    class Meta:
        model = User
        fields = ["first_name", "last_name"]
