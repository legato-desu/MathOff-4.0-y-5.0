import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
  role: string | number | { name?: string; nombre?: string; id?: number };
  is_active?: boolean;
  isActive?: boolean;
  activo?: boolean;
}

const normalizeRole = (value: unknown): RoleName | null => {
  if (typeof value === "object" && value !== null) {
    const obj = value as { name?: string; nombre?: string; id?: number };
    value = obj.name ?? obj.nombre ?? obj.id;
  }

  if (String(value) === "5") return "Estudiante";
  if (String(value) === "6") return "Docente";
  if (String(value) === "1") return "Root";
  if (String(value) === "2") return "Administrador";

  const roleName = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["root", "superusuario"].includes(roleName)) return "Root";
  if (["admin", "administrador"].includes(roleName)) return "Administrador";
  if (["docente", "profesor"].includes(roleName)) return "Docente";
  if (roleName === "estudiante") return "Estudiante";
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

      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { detail: responseText };
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            (response.status === 403
              ? "No tienes permisos para realizar esta operación."
              : `Error del servidor (${response.status}).`)
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
      const list = Array.isArray(data) ? data : data?.results;
      if (!Array.isArray(list)) {
        throw new Error("La API no devolvió una lista de usuarios válida.");
      }
      setUsers(list);
    } catch (error: unknown) {
      openErrorModal(
        error instanceof Error ? error.message : "Error cargando usuarios."
      );
    } finally {
      setLoading(false);
    }
  }, [canManageUsers, request]);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  const puedeGestionar = (target: Usuario): boolean => {
    const targetRole = normalizeRole(target.role);
    const myId = Number(currentUser?.user_id ?? currentUser?.id ?? 0);
    const targetId = Number(target.id);

    if (!targetRole || !currentRole || targetId === myId) return false;

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
          role: Number(role) || role.trim(),
        }),
      });
      limpiarFormulario();
      await cargarUsuarios();
      openSuccessModal("Usuario creado correctamente.");
    } catch (error: unknown) {
      openErrorModal(
        error instanceof Error ? error.message : "No se pudo crear el usuario."
      );
    }
  };

  const editarUsuario = (user: Usuario) => {
    if (!puedeGestionar(user)) {
      openErrorModal(
        "No puedes editar usuarios de tu mismo rango o de uno superior."
      );
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
    if (editandoId === null) return;

    const user = users.find((item) => item.id === editandoId);
    if (!user || !puedeGestionar(user)) {
      openErrorModal("No tienes permiso para modificar este usuario.");
      return;
    }
    if (!role.trim()) {
      openErrorModal("Ingresa el ID o nombre del rol.");
      return;
    }

    try {
      await request(`/users/${editandoId}/`, {
        method: "PATCH",
        body: JSON.stringify({ role: Number(role) || role.trim() }),
      });
      limpiarFormulario();
      await cargarUsuarios();
      openSuccessModal("Usuario actualizado correctamente.");
    } catch (error: unknown) {
      openErrorModal(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el usuario."
      );
    }
  };

  const cambiarEstadoUsuario = (user: Usuario) => {
    if (!puedeGestionar(user)) {
      openErrorModal("No puedes gestionar una cuenta de este rango.");
      return;
    }

    const habilitar = !estaActivo(user);
    const accion = habilitar ? "habilitar" : "deshabilitar";
    const endpointPath = habilitar ? "enable" : "disable";

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
              await request(`/users/${user.id}/${endpointPath}/`, {
                method: "POST",
              });
              setUsers((previous) =>
                previous.map((item) =>
                  item.id === user.id ? { ...item, is_active: habilitar } : item
                )
              );
              openSuccessModal(
                `La cuenta de ${user.username} fue ${
                  habilitar ? "habilitada" : "deshabilitada"
                } correctamente.`
              );
            } catch (error: unknown) {
              openErrorModal(
                error instanceof Error
                  ? error.message
                  : "No se pudo cambiar el estado de la cuenta."
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const fieldStyle = {
    backgroundColor: colors.card,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  } as const;

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            {editandoId !== null ? "Editar usuario" : "Crear usuario"}
          </Text>
          <TextInput
            placeholder="Nombre de usuario"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={editandoId === null}
            style={[fieldStyle, editandoId !== null && { opacity: 0.65 }]}
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={editandoId === null}
            style={[fieldStyle, editandoId !== null && { opacity: 0.65 }]}
          />
          <TextInput
            placeholder="ID del rol (5 Estudiante, 6 Docente)"
            placeholderTextColor={colors.textMuted}
            value={role}
            onChangeText={setRole}
            autoCapitalize="none"
            style={fieldStyle}
          />
          <TouchableOpacity
            onPress={() => void (editandoId !== null ? guardarCambios() : crearUsuario())}
            style={{
              backgroundColor: colors.primary,
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              {editandoId !== null ? "Guardar cambios" : "Crear usuario"}
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
            Usuarios
          </Text>
          <TouchableOpacity onPress={() => void cargarUsuarios()} accessibilityRole="button">
            <Ionicons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : users.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 16 }}>
            No hay usuarios para mostrar.
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
                    <Text style={{ color: colors.text, fontSize: 17, fontWeight: "bold" }}>
                      {user.username}
                    </Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      {user.email}
                    </Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      Rol: {targetRole ?? String(typeof user.role === "object" ? user.role.name ?? user.role.nombre ?? user.role.id ?? "Desconocido" : user.role)}
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
                    <Text style={{ color: activo ? "#168B58" : "#C0392B", fontWeight: "600" }}>
                      {activo ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>

                {permitido ? (
                  <View>
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
                      <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Editar rol</Text>
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
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                          {activo ? "Deshabilitar cuenta" : "Habilitar cuenta"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  ) : (
                    <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 12 }}>
                      No tienes permisos para modificar esta cuenta.
                    </Text>
                  )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
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
                  name={modalType === "success" ? "checkmark-circle" : "alert-circle"}
                  size={60}
                  color={modalType === "success" ? colors.success : colors.error}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 17,
                    textAlign: "center",
                    marginTop: 14,
                  }}
                >
                  {modalMessage}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{
                    marginTop: 25,
                    backgroundColor: modalType === "success" ? colors.success : colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 40,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
