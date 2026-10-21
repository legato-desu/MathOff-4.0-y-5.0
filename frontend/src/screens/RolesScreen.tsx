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

export default function RolesScreen() {

  const { colors } = useTheme();

  const [roles, setRoles] =
    useState<any[]>([]);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [nombre, setNombre] =
    useState("");

  const [descripcion,
    setDescripcion] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [modalMessage, setModalMessage] =
    useState("");

  const [modalType, setModalType] =
    useState<"success" | "error">("success");

  useEffect(() => {
    cargarRoles();
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

  const cargarRoles = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/roles/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setRoles(data);
      }

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error cargando roles"
      );
    }
  };

  const crearRol = async () => {

    if (!nombre) {
      openErrorModal(
        "Ingresa el nombre del rol"
      );
      return;
    }

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/roles/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            nombre,
            descripcion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo crear rol"
        );
      }

      openSuccessModal(
        "Rol creado correctamente"
      );

      limpiarFormulario();

      cargarRoles();

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error creando rol"
      );
    }
  };

  const editarRol = (role: any) => {

    setEditandoId(role.id);

    setNombre(role.nombre);

    setDescripcion(
      role.descripcion || ""
    );
  };

  const guardarCambios = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/roles/${editandoId}/`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            nombre,
            descripcion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo actualizar"
        );
      }

      openSuccessModal(
        "Rol actualizado"
      );

      limpiarFormulario();

      cargarRoles();

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error actualizando rol"
      );
    }
  };

  const eliminarRol = async (
    id: number
  ) => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/roles/${id}/`,
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
        "Rol eliminado"
      );

      setRoles((prev) =>
        prev.filter(
          (r) => r.id !== id
        )
      );

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error eliminando rol"
      );
    }
  };

  const limpiarFormulario = () => {

    setEditandoId(null);

    setNombre("");

    setDescripcion("");
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
        Gestión de Roles
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
          placeholder="Nombre del rol"
          placeholderTextColor={
            colors.textMuted
          }
          value={nombre}
          onChangeText={setNombre}
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
          placeholder="Descripción"
          placeholderTextColor={
            colors.textMuted
          }
          value={descripcion}
          onChangeText={
            setDescripcion
          }
          multiline
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
            minHeight: 90,
          }}
        />

        <TouchableOpacity
          onPress={
            editandoId
              ? guardarCambios
              : crearRol
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
              : "Crear Rol"}
          </Text>
        </TouchableOpacity>

      </View>

      {roles.map((role) => (

        <View
          key={role.id}
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
            {role.nombre}
          </Text>

          <Text
            style={{
              color:
                colors.textSecondary,

              marginTop: 6,
            }}
          >
            {role.descripcion}
          </Text>

          <TouchableOpacity
            onPress={() =>
              editarRol(role)
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
              eliminarRol(role.id)
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