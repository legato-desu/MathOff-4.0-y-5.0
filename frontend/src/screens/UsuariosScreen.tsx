
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../servicios/config";
import { useTheme } from "../theme/ThemeContext";
import { useAuthStore } from "../store/authStore";

type RoleName = "Root" | "Administrador" | "Docente" | "Estudiante";

interface Usuario {
  id: number;
  username: string;
  email: string;
  role: string | { name?: string; nombre?: string; id?: number };
  is_active?: boolean;
  isActive?: boolean;
  activo?: boolean;
}

const normalizeRole = (value: unknown): RoleName | null => {
  const raw =
    typeof value === "object" && value !== null
      ? (value as any).name ??
        (value as any).nombre ??
        (value as any).id
      : value;

  const role = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["root", "superusuario"].includes(role)) return "Root";
  if (["admin", "administrador"].includes(role)) return "Administrador";
  if (["docente", "profesor"].includes(role)) return "Docente";
  if (role === "estudiante") return "Estudiante";

  return null;
};

export default function UsuariosScreen() {
  const { colors } = useTheme();
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = normalizeRole(currentUser?.role);

  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const canManageUsers = ["Root", "Administrador", "Docente"].includes(
    currentRole ?? ""
  );

  const openSuccessModal = (message: string) => {
    setModalMessage(message);
    setModalType("success");
    setShowModal(true);
  };

  const openErrorModal = (message: string) => {
    setModalMessage(message);
    setModalType("error");
    setShowModal(true);
  };

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const text = await response.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { detail: text };
      }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "No tienes permisos para realizar esta operación."
          );
        }

        throw new Error(
          data.detail ||
            data.message ||
            `Error del servidor (${response.status}).`
        );
      }

      return data;
    },
    []
  );

  const cargarUsuarios = useCallback(async () => {
    if (!canManageUsers) return;

    setLoading(true);

    try {
      const data = await request("/users/");
      const list = Array.isArray(data) ? data : data.results;

      if (!Array.isArray(list)) {
        throw new Error("La API no devolvió una lista de usuarios válida.");
      }

      setUsers(list);
    } catch (error: any) {
      openErrorModal(error.message || "Error cargando usuarios.");
    } finally {
      setLoading(false);
    }
  }, [canManageUsers, request]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Jerarquía: un usuario solo puede gestionar rangos inferiores.
  const puedeGestionar = (target: Usuario): boolean => {
    const targetRole = normalizeRole(target.role);

    if (!targetRole || !currentRole) return false;
    if (target.id === Number((currentUser as any)?.user_id ?? (currentUser as any)?.id)) {
      return false;
    }

    if (currentRole === "Root") {
      return ["Administrador", "Docente", "Estudiante"].includes(targetRole);
    }

    if (currentRole === "Administrador") {
      return ["Docente", "Estudiante"].includes(targetRole);
    }

    if (currentRole === "Docente") {
      return targetRole === "Estudiante";
    }

    return false;
  };

  const estaActivo = (user: Usuario): boolean => {
    if (typeof user.is_active === "boolean") return user.is_active;
    if (typeof user.isActive === "boolean") return user.isActive;
    if (typeof user.activo === "boolean") return user.activo;

    // No asumir que una cuenta está inactiva si la API no envía su estado.
    return true;
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setUsername("");
    setEmail("");
    setRole("");
  };

  const crearUsuario = async () => {
    if (!username.trim() || !email.trim() || !role.trim()) {
      openErrorModal("Completa el nombre, correo y rol.");
      return;
    }

    try {
      await request("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          role,
        }),
      });

      limpiarFormulario();
      await cargarUsuarios();
      openSuccessModal("Usuario creado correctamente.");
    } catch (error: any) {
      openErrorModal(error.message || "No se pudo crear el usuario.");
    }
  };

  const editarUsuario = (user: Usuario) => {
    if (!puedeGestionar(user)) {
      openErrorModal("No puedes editar usuarios de tu mismo rango o de uno superior.");
      return;
    }

    setEditandoId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setRole(
      typeof user.role === "object"
        ? String(user.role.id ?? user.role.name ?? user.role.nombre ?? "")
        : String(user.role ?? "")
    );
  };

  const guardarCambios = async () => {
    if (!editandoId) return;

    const user = users.find((item) => item.id === editandoId);

    if (!user || !puedeGestionar(user)) {
      openErrorModal("No tienes permiso para modificar este usuario.");
      return;
    }

    try {
      await request(`/users/${editandoId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          role,
        }),
      });

      limpiarFormulario();
      await cargarUsuarios();
      openSuccessModal("Usuario actualizado correctamente.");
    } catch (error: any) {
      openErrorModal(error.message || "No se pudo actualizar el usuario.");
    }
  };

  // Utiliza PATCH sobre el usuario existente; no elimina su registro.
  const cambiarEstadoUsuario = (user: Usuario) => {
    if (!puedeGestionar(user)) {
      openErrorModal("No puedes gestionar una cuenta de este rango.");
      return;
    }

    const habilitar = !estaActivo(user);
    const accion = habilitar ? "habilitar" : "deshabilitar";

    Alert.alert(
      `${habilitar ? "Habilitar" : "Deshabilitar"} cuenta`,
      `¿Deseas ${accion} la cuenta de ${user.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: habilitar ? "default" : "destructive",
          onPress: async () => {
            setProcessingId(user.id);

            try {
              // El modelo de usuario Django normalmente utiliza is_active.
              await request(`/users/${user.id}/`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: habilitar }),
              });

              setUsers((previous) =>
                previous.map((item) =>
                  item.id === user.id
                    ? { ...item, is_active: habilitar }
                    : item
                )
              );

              openSuccessModal(
                `La cuenta de ${user.username} fue ${
                  habilitar ? "habilitada" : "deshabilitada"
                } correctamente.`
              );
            } catch (error: any) {
              openErrorModal(
                error.message ||
                  "No se pudo cambiar el estado de la cuenta."
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (!canManageUsers) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Ionicons name="lock-closed-outline" size={54} color={colors.error} />
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "bold",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Acceso restringido
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Tu rol no permite acceder a la gestión de usuarios.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        Gestión de Usuarios
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
        Sesión: {currentUser?.username ?? "Usuario"} · {currentRole ?? "Sin rol"}
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 18,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TextInput
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="ID del rol (según la base de datos)"
          placeholderTextColor={colors.textMuted}
          value={role}
          onChangeText={setRole}
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 15,
          }}
        />

        <TouchableOpacity
          onPress={editandoId ? guardarCambios : crearUsuario}
          style={{
            backgroundColor: colors.primary,
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {editandoId ? "Guardar cambios" : "Crear usuario"}
          </Text>
        </TouchableOpacity>

        {editandoId !== null && (
          <TouchableOpacity
            onPress={limpiarFormulario}
            style={{ padding: 12, alignItems: "center", marginTop: 4 }}
          >
            <Text style={{ color: colors.textSecondary }}>Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>
          Usuarios registrados
        </Text>

        <TouchableOpacity onPress={cargarUsuarios} disabled={loading}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : users.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>
          No hay usuarios disponibles.
        </Text>
      ) : (
        users.map((user) => {
          const permitido = puedeGestionar(user);
          const activo = estaActivo(user);
          const targetRole = normalizeRole(user.role);

          return (
            <View
              key={user.id}
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    {user.username}
                  </Text>

                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {user.email}
                  </Text>

                  <Text style={{ color: colors.primary, marginTop: 6 }}>
                    Rol: {targetRole ?? String(user.role ?? "Sin rol")}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: activo ? "#168B5822" : "#C0392B22",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: activo ? "#168B58" : "#C0392B",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    {activo ? "Habilitado" : "Inhabilitado"}
                  </Text>
                </View>
              </View>

              {permitido ? (
                <>
                  <TouchableOpacity
                    onPress={() => editarUsuario(user)}
                    style={{
                      backgroundColor: colors.button,
                      padding: 13,
                      borderRadius: 12,
                      marginTop: 14,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: "bold" }}>
                      Editar usuario
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={processingId === user.id}
                    onPress={() => cambiarEstadoUsuario(user)}
                    style={{
                      backgroundColor: activo ? "#C0392B" : "#168B58",
                      padding: 13,
                      borderRadius: 12,
                      marginTop: 10,
                      alignItems: "center",
                      opacity: processingId === user.id ? 0.6 : 1,
                    }}
                  >
                    {processingId === user.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {activo ? "Deshabilitar cuenta" : "Habilitar cuenta"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <Text
                  style={{
                    color: colors.textMuted,
                    marginTop: 14,
                    fontSize: 12,
                  }}
                >
                  Tu rango no permite modificar esta cuenta.
                </Text>
              )}
            </View>
          );
        })
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: "90%",
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  padding: 25,
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={
                    modalType === "success"
                      ? "checkmark-circle"
                      : "alert-circle"
                  }
                  size={60}
                  color={modalType === "success" ? colors.success : colors.error}
                />

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 22,
                    fontWeight: "bold",
                    marginTop: 15,
                  }}
                >
                  {modalType === "success" ? "Éxito" : "Error"}
                </Text>

                <Text
                  style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginTop: 12,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {modalMessage}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{
                    marginTop: 25,
                    backgroundColor:
                      modalType === "success" ? colors.success : colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 40,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                    Entendido
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}
