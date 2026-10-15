from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

from .models import User

from .serializers import (
    RegisterSerializer,
    UserListSerializer,
    RoleSerializer,
)

from .login_serializer import (
    CustomTokenObtainPairSerializer,
)

from .permissions import IsAdministrador

from roles.models import Role


# LOGIN
class CustomLoginView(TokenObtainPairView):
    serializer_class = (
        CustomTokenObtainPairSerializer
    )


# REGISTER
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


# CRUD USUARIOS
class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by(
        "-id"
    )

    serializer_class = UserListSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdministrador,
    ]


# CRUD ROLES
class RoleViewSet(viewsets.ModelViewSet):

    queryset = Role.objects.all().order_by(
        "-id"
    )

    serializer_class = RoleSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdministrador,
    ]
