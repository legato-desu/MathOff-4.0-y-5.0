from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    ChangePasswordView,
    CustomLoginView,
    UserViewSet,
    RoleViewSet,
)

router = DefaultRouter()

router.register(
    r'users',
    UserViewSet,
    basename='users'
)

router.register(
    r'roles',
    RoleViewSet,
    basename='roles'
)

urlpatterns = [

    path(
        "users/change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        CustomLoginView.as_view(),
        name="login",
    ),

    path(
        "",
        include(router.urls),
    ),
]
