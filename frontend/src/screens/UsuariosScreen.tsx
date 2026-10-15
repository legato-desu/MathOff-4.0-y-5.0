import { API_URL } from "../servicios/config";
import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UsuariosScreen() {

  const { colors } = useTheme();

  const [users, setUsers] =
    useState<any[]>([]);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [modalMessage, setModalMessage] =
    useState("");

  const [modalType, setModalType] =
    useState<"success" | "error">("success");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const openSuccessModal = (
    message: string
  ) => {
    setModalMessage(message);
    setModalType("success");
    setShowModal(true);
  };

  const openErrorModal = (
    message: string
  ) => {
    setModalMessage(message);
    setModalType("error");
    setShowModal(true);
  };

  const cargarUsuarios = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/users/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      }

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error cargando usuarios"
      );
    }
  };

  const crearUsuario = async () => {

    if (!username || !email) {
      openErrorModal(
        "Completa todos los campos"
      );
      return;
    }

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/users/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            username,
            email,
            role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo crear usuario"
        );
      }

      openSuccessModal(
        "Usuario creado correctamente"
      );

      limpiarFormulario();
      cargarUsuarios();

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error creando usuario"
      );
    }
  };

  const editarUsuario = (
    user: any
  ) => {

    setEditandoId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setRole(
      user.role?.toString() || ""
    );
  };

  const guardarCambios = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/users/${editandoId}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            username,
            email,
            role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo actualizar"
        );
      }

      openSuccessModal(
        "Usuario actualizado"
      );

      limpiarFormulario();
      cargarUsuarios();

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error actualizando usuario"
      );
    }
  };

  const eliminarUsuario = async (
    id: number
  ) => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/users/${id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo eliminar"
        );
      }

      openSuccessModal(
        "Usuario eliminado"
      );

      setUsers((prev) =>
        prev.filter(
          (u) => u.id !== id
        )
      );

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error eliminando usuario"
      );
    }
  };

  const limpiarFormulario = () => {

    setEditandoId(null);
    setUsername("");
    setEmail("");
    setRole("");
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor:
          colors.background,
        padding: 20,
      }}
    >

      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Gestión de Usuarios
      </Text>

      <View
        style={{
          backgroundColor:
            colors.surface,
          borderRadius: 16,
          padding: 18,
          marginBottom: 25,
          borderWidth: 1,
          borderColor:
            colors.border,
        }}
      >

        <TextInput
          placeholder="Username"
          placeholderTextColor={
            colors.textMuted
          }
          value={username}
          onChangeText={setUsername}
          style={{
            backgroundColor:
              colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor:
              colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor={
            colors.textMuted
          }
          value={email}
          onChangeText={setEmail}
          style={{
            backgroundColor:
              colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor:
              colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="ID Rol"
          placeholderTextColor={
            colors.textMuted
          }
          value={role}
          onChangeText={setRole}
          style={{
            backgroundColor:
              colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor:
              colors.border,
            padding: 14,
            borderRadius: 12,
            marginBottom: 15,
          }}
        />

        <TouchableOpacity
          onPress={
            editandoId
              ? guardarCambios
              : crearUsuario
          }
          style={{
            backgroundColor:
              colors.primary,
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            {editandoId
              ? "Guardar Cambios"
              : "Crear Usuario"}
          </Text>
        </TouchableOpacity>

      </View>

      {users.map((user) => (

        <View
          key={user.id}
          style={{
            backgroundColor:
              colors.surface,
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor:
              colors.border,
          }}
        >

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
              color:
                colors.textSecondary,

              marginTop: 4,
            }}
          >
            {user.email}
          </Text>

          <Text
            style={{
              color: colors.primary,

              marginTop: 6,
            }}
          >
            Rol:
            {" "}
            {user.role}
          </Text>

          <TouchableOpacity
            onPress={() =>
              editarUsuario(user)
            }
            style={{
              backgroundColor:
                colors.button,
              padding: 13,
              borderRadius: 12,
              marginTop: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "bold",
              }}
            >
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              eliminarUsuario(
                user.id
              )
            }
            style={{
              backgroundColor:
                colors.error,
              padding: 13,
              borderRadius: 12,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Eliminar
            </Text>
          </TouchableOpacity>

        </View>
      ))}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setShowModal(false)
          }
        >
          <View
            style={{
              flex: 1,
              backgroundColor:
                "rgba(0,0,0,0.6)",
              justifyContent:
                "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <TouchableWithoutFeedback>

              <View
                style={{
                  width: "90%",
                  backgroundColor:
                    colors.card,
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
                  size={65}
                  color={
                    modalType === "success"
                      ? colors.success
                      : colors.error
                  }
                />

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 22,
                    fontWeight: "bold",
                    marginTop: 15,
                  }}
                >
                  {modalType === "success"
                    ? "Éxito"
                    : "Error"}
                </Text>

                <Text
                  style={{
                    color:
                      colors.textSecondary,
                    textAlign: "center",
                    marginTop: 12,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {modalMessage}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowModal(false)
                  }
                  style={{
                    marginTop: 25,

                    backgroundColor:
                      modalType === "success"
                        ? colors.success
                        : colors.primary,
                    paddingVertical: 12,
                    paddingHorizontal: 40,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
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