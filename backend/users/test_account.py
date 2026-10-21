from django.test import TestCase
from rest_framework.test import APIClient

from .models import User
from roles.models import Role


class AccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_assigns_student_role_even_if_client_requests_admin(self):
        administrator = Role.objects.create(nombre="Administrador")
        response = self.client.post("/api/register/", {
            "username": "student", "email": "student@example.test",
            "password": "StrongPass2026!", "role": administrator.id,
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.get(username="student").role.nombre, "Estudiante")

    def test_change_password_requires_current_password(self):
        user = User.objects.create_user("student", email="student@example.test", password="OriginalPass2026!")
        self.client.force_authenticate(user=user)
        wrong = self.client.post("/api/users/change-password/", {
            "current_password": "incorrect", "new_password": "NewPass2026!",
        })
        self.assertEqual(wrong.status_code, 400)
        correct = self.client.post("/api/users/change-password/", {
            "current_password": "OriginalPass2026!", "new_password": "NewPass2026!",
        })
        self.assertEqual(correct.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass2026!"))

    def test_teacher_can_disable_student_but_not_admin(self):
        teacher_role, _ = Role.objects.get_or_create(nombre="Docente")
        student_role, _ = Role.objects.get_or_create(nombre="Estudiante")
        admin_role, _ = Role.objects.get_or_create(nombre="Administrador")
        teacher = User.objects.create_user("teacher", email="teacher@example.test", password="StrongPass2026!", role=teacher_role)
        student = User.objects.create_user("student2", email="student2@example.test", password="StrongPass2026!", role=student_role)
        admin = User.objects.create_user("admin2", email="admin2@example.test", password="StrongPass2026!", role=admin_role)
        self.client.force_authenticate(user=teacher)
        allowed = self.client.post(f"/api/users/{student.id}/disable/")
        denied = self.client.post(f"/api/users/{admin.id}/disable/")
        self.assertEqual(allowed.status_code, 200)
        self.assertFalse(User.objects.get(pk=student.id).is_active)
        self.assertEqual(denied.status_code, 403)

    def test_root_can_disable_admin_and_disabled_user_cannot_login(self):
        root = User.objects.create_superuser("root", email="root@example.test", password="StrongPass2026!")
        admin_role, _ = Role.objects.get_or_create(nombre="Administrador")
        admin = User.objects.create_user("admin3", email="admin3@example.test", password="StrongPass2026!", role=admin_role)
        self.client.force_authenticate(user=root)
        response = self.client.post(f"/api/users/{admin.id}/disable/")
        self.assertEqual(response.status_code, 200)
        self.client.force_authenticate(user=None)
        login_response = self.client.post("/api/token/", {"username": "admin3", "password": "StrongPass2026!"})
        self.assertEqual(login_response.status_code, 401)
