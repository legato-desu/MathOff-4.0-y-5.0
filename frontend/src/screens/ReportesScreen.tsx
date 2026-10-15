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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReportesScreen() {

  const { colors } = useTheme();

  const [ejercicios, setEjercicios] =
    useState<any[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [modalMessage, setModalMessage] =
    useState("");

  const [modalType, setModalType] =
    useState<"success" | "error">("success");

  useEffect(() => {
    cargar();
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

  const cargar = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const res = await fetch(
        `${API_URL}/ejercicios/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setEjercicios(data);
      }

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error cargando reportes"
      );
    }
  };

  const eliminarEjercicio = async (
    id: number
  ) => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/ejercicios/${id}/`,
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
        "Ejercicio eliminado"
      );

      setEjercicios((prev) =>
        prev.filter(
          (e) => e.id !== id
        )
      );

    } catch (error: any) {

      openErrorModal(
        error.message ||
        "Error eliminando ejercicio"
      );
    }
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
        Reportes Generales
      </Text>

      {ejercicios.map((e) => (

        <View
          key={e.id}
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
            {e.titulo}
          </Text>

          <Text
            style={{
              color:
                colors.textSecondary,

              marginTop: 8,
            }}
          >
            {e.descripcion}
          </Text>

          <TouchableOpacity
            onPress={() =>
              eliminarEjercicio(
                e.id
              )
            }
            style={{
              backgroundColor:
                colors.error,

              padding: 13,

              borderRadius: 12,

              marginTop: 15,

              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Eliminar Ejercicio
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