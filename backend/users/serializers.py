from rest_framework import serializers
from .models import User
from roles.models import Role
from .permissions import role_rank, role_name


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        # Nunca aceptar el rol enviado desde el cliente durante el registro.
        role, _ = Role.objects.get_or_create(nombre="Estudiante")
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
        )


class UserListSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False, allow_null=True)
    role_name = serializers.CharField(source="role.nombre", read_only=True, default=None)

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "role_name", "is_staff", "is_active"]
        read_only_fields = ["id", "username", "email", "is_staff", "is_active"]

    def validate_role(self, new_role):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Se requiere una sesión autenticada.")
        actor_rank = role_rank(request.user)
        new_rank = role_rank(new_role.nombre if new_role else "")
        if actor_rank is None or new_rank is None or new_rank <= actor_rank:
            raise serializers.ValidationError("No puedes asignar un rol de tu mismo nivel o superior.")
        return new_role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "nombre", "descripcion"]

    def validate_nombre(self, value):
        normalized = value.strip().casefold()
        if normalized not in {"root", "superusuario", "administrador", "admin", "docente", "estudiante"}:
            raise serializers.ValidationError("Usa uno de los roles jerárquicos admitidos: Root, Administrador, Docente o Estudiante.")
        request = self.context.get("request")
        if request and role_rank(request.user) != 0:
            raise serializers.ValidationError("Solo root puede administrar roles.")
        return value.strip()
