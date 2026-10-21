from rest_framework.exceptions import AuthenticationFailed
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        token["user_id"] = user.id
        token["role"] = ("Root" if user.is_superuser else (user.role.nombre if user.role else None))
        return token

    def validate(self, attrs):
        # Diferencia una cuenta inhabilitada de unas credenciales incorrectas,
        # sin revelar el estado si la contraseña no coincide.
        username = attrs.get(self.username_field, "")
        password = attrs.get("password", "")
        candidate = User.objects.filter(**{self.username_field: username}).first()
        if candidate and candidate.check_password(password) and not candidate.is_active:
            raise AuthenticationFailed("Esta cuenta está inhabilitada. Contacta al docente o administrador.")
        data = super().validate(attrs)
        # Django normalmente bloquea is_active=False; esta comprobación mantiene
        # explícito el requisito si cambia la configuración de autenticación.
        if not self.user.is_active:
            raise AuthenticationFailed("Esta cuenta está deshabilitada. Contacta al administrador.")
        data["username"] = self.user.username
        data["email"] = self.user.email
        data["user_id"] = self.user.id
        data["role"] = ("Root" if self.user.is_superuser else (self.user.role.nombre if self.user.role else None))
        return data
