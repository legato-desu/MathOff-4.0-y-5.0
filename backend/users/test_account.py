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
