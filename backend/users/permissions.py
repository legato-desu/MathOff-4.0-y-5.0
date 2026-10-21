from rest_framework.permissions import BasePermission


# Menor número = mayor autoridad. Los nombres se normalizan para admitir
# variantes comunes sin conceder permisos por coincidencias parciales.
ROLE_RANK = {
    "root": 0,
    "superusuario": 0,
    "administrador": 1,
    "admin": 1,
    "docente": 2,
    "estudiante": 3,
}


def role_name(user):
    if getattr(user, "is_superuser", False):
        return "root"
    role = getattr(user, "role", None)
    return str(getattr(role, "nombre", "") or "").strip().casefold()


def role_rank(user_or_name):
    name = role_name(user_or_name) if hasattr(user_or_name, "is_authenticated") else str(user_or_name or "").strip().casefold()
    return ROLE_RANK.get(name)


def can_manage_user(actor, target):
    actor_rank = role_rank(actor)
    target_rank = role_rank(target)
    return (
        getattr(actor, "is_authenticated", False)
        and actor_rank is not None
        and target_rank is not None
        and target_rank > actor_rank
        and actor.pk != target.pk
    )


class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and role_rank(request.user) in (0, 1))


class IsRoot(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and role_rank(request.user) == 0)
