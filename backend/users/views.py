from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import RegisterSerializer, UserListSerializer, RoleSerializer
from .login_serializer import CustomTokenObtainPairSerializer
from .permissions import IsRoot, can_manage_user, role_rank
from roles.models import Role


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get("current_password", "")
        new = request.data.get("new_password", "")
        if not request.user.check_password(current):
            return Response({"detail": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new, request.user)
        except ValidationError as error:
            return Response({"detail": " ".join(error.messages)}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new)
        request.user.save(update_fields=["password"])
        return Response({"detail": "Contraseña actualizada."})


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options", "post"]

    def get_queryset(self):
        actor = self.request.user
        if role_rank(actor) not in (0, 1, 2):
            return User.objects.none()
        return User.objects.select_related("role").exclude(pk=actor.pk).order_by("-id")

    def get_permissions(self):
        # El listado y los cambios de estado se validan con la jerarquía en cada acción.
        return [IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        target = self.get_object()
        if not can_manage_user(request.user, target):
            return Response({"detail": "No tienes permisos para administrar esta cuenta."}, status=status.HTTP_403_FORBIDDEN)
        return Response(self.get_serializer(target).data)

    def list(self, request, *args, **kwargs):
        actor_rank = role_rank(request.user)
        if actor_rank not in (0, 1, 2):
            return Response({"detail": "No tienes permisos para listar usuarios."}, status=status.HTTP_403_FORBIDDEN)
        targets = [u for u in self.get_queryset() if can_manage_user(request.user, u)]
        return Response(self.get_serializer(targets, many=True).data)

    def partial_update(self, request, *args, **kwargs):
        target = self.get_object()
        if not can_manage_user(request.user, target):
            return Response({"detail": "Solo puedes modificar usuarios de un rango inferior."}, status=status.HTTP_403_FORBIDDEN)
        if set(request.data.keys()) - {"role"}:
            return Response({"detail": "Solo se permite modificar el rol desde esta operación."}, status=status.HTTP_400_BAD_REQUEST)
        if role_rank(request.user) != 0 and "role" in request.data:
            return Response({"detail": "Solo root puede cambiar los roles."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(target, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="disable")
    def disable(self, request, pk=None):
        target = self.get_object()
        if not can_manage_user(request.user, target):
            return Response({"detail": "Solo puedes deshabilitar usuarios de un rango inferior."}, status=status.HTTP_403_FORBIDDEN)
        if not target.is_active:
            return Response({"detail": "La cuenta ya está deshabilitada."}, status=status.HTTP_400_BAD_REQUEST)
        target.is_active = False
        target.save(update_fields=["is_active"])
        return Response({"detail": f"Cuenta de {target.username} deshabilitada.", "is_active": False})

    @action(detail=True, methods=["post"], url_path="enable")
    def enable(self, request, pk=None):
        target = self.get_object()
        if not can_manage_user(request.user, target):
            return Response({"detail": "Solo puedes habilitar usuarios de un rango inferior."}, status=status.HTTP_403_FORBIDDEN)
        if target.is_active:
            return Response({"detail": "La cuenta ya está habilitada."}, status=status.HTTP_400_BAD_REQUEST)
        target.is_active = True
        target.save(update_fields=["is_active"])
        return Response({"detail": f"Cuenta de {target.username} habilitada.", "is_active": True})

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Las cuentas no se eliminan desde este panel. Deshabilítalas para conservar su historial."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("id")
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsRoot]
