from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ejercicios.models import Ejercicio
from respuestas.models import Respuesta
from users.models import User


class EstadisticasDashboardView(APIView):
    """Resumen agregado para el análisis exploratorio del proyecto MathOff."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        rol = (usuario.role.nombre if usuario.role else "").strip().lower()
        roles_permitidos = {"root", "superusuario", "administrador", "admin", "docente"}
        if not (usuario.is_superuser or rol in roles_permitidos):
            return Response(
                {"detail": "No tienes permisos para consultar las estadísticas generales."},
                status=403,
            )

        hoy = timezone.localdate()
        inicio_periodo = hoy - timedelta(days=179)
        respuestas = Respuesta.objects.select_related("ejercicio", "estudiante")
        respuestas_periodo = respuestas.filter(fecha_respuesta__date__gte=inicio_periodo)

        total_usuarios = User.objects.count()
        usuarios_activos = User.objects.filter(is_active=True).count()
        total_ejercicios = Ejercicio.objects.count()
        total_respuestas = respuestas.count()
        respuestas_correctas = respuestas.filter(es_correcta=True).count()
        tasa_acierto = round((respuestas_correctas / total_respuestas) * 100, 1) if total_respuestas else 0

        por_mes_query = (
            respuestas_periodo.annotate(mes=TruncMonth("fecha_respuesta"))
            .values("mes")
            .annotate(total=Count("id"), correctas=Count("id", filter=Q(es_correcta=True)))
            .order_by("mes")
        )
        actividad_por_mes = [
            {
                "mes": item["mes"].strftime("%Y-%m") if item["mes"] else "Sin fecha",
                "total": item["total"],
                "correctas": item["correctas"],
            }
            for item in por_mes_query
        ]

        por_ejercicio = list(
            Ejercicio.objects.annotate(
                intentos=Count("respuestas"),
                correctas=Count("respuestas", filter=Q(respuestas__es_correcta=True)),
            )
            .values("id", "titulo", "intentos", "correctas")
            .order_by("-intentos", "titulo")[:6]
        )
        for item in por_ejercicio:
            item["porcentaje_acierto"] = round(item["correctas"] * 100 / item["intentos"], 1) if item["intentos"] else 0

        usuarios_por_rol = list(
            User.objects.values("role__nombre")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        distribucion_roles = [
            {"rol": item["role__nombre"] or "Sin rol", "total": item["total"]}
            for item in usuarios_por_rol
        ]

        ultimas_respuestas = list(
            respuestas.order_by("-fecha_respuesta").values(
                "id", "estudiante__username", "ejercicio__titulo", "es_correcta", "fecha_respuesta"
            )[:8]
        )
        recientes = [
            {
                "id": item["id"],
                "estudiante": item["estudiante__username"],
                "ejercicio": item["ejercicio__titulo"],
                "correcta": item["es_correcta"],
                "fecha": timezone.localtime(item["fecha_respuesta"]).strftime("%d/%m/%Y %H:%M") if item["fecha_respuesta"] else "—",
            }
            for item in ultimas_respuestas
        ]

        return Response({
            "generado_en": timezone.localtime().strftime("%d/%m/%Y %H:%M"),
            "periodo_desde": inicio_periodo.strftime("%d/%m/%Y"),
            "resumen": {
                "usuarios": total_usuarios,
                "usuarios_activos": usuarios_activos,
                "ejercicios": total_ejercicios,
                "respuestas": total_respuestas,
                "correctas": respuestas_correctas,
                "incorrectas": total_respuestas - respuestas_correctas,
                "tasa_acierto": tasa_acierto,
            },
            "actividad_por_mes": actividad_por_mes,
            "ejercicios_destacados": por_ejercicio,
            "distribucion_roles": distribucion_roles,
            "ultimas_respuestas": recientes,
        })
