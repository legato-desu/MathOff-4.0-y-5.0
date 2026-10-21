import { API_URL } from "../servicios/config";
import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";
import CustomModal from "../components/CustomModal";
export default function EstudianteDashboard() {

  const { colors } = useTheme();

  const [ejercicios, setEjercicios] =
    useState<any[]>([]);

  const [respuestas, setRespuestas] =
    useState<{
      [key: number]: string;
    }>({});

  const [showModal, setShowModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [modalType, setModalType] =
    useState<
      "success" |
      "error" |
      "warning"
    >("success");

  useEffect(() => {
    cargarEjercicios();
  }, []);

  const openSuccessModal = (
    message: string
  ) => {

    setModalTitle("Éxito");

    setModalMessage(message);

    setModalType("success");

    setShowModal(true);
  };

  const openErrorModal = (
    message: string
  ) => {

    setModalTitle("Error");

    setModalMessage(message);

    setModalType("error");

    setShowModal(true);
  };

  const cargarEjercicios = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/ejercicios/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      setEjercicios(data);

    } catch (error) {

      console.log(
        "ERROR EJERCICIOS:",
        error
      );

      openErrorModal(
        "No se pudieron cargar los ejercicios"
      );
    }
  };

  const enviarRespuesta = async (
    item: any
  ) => {

    try {

      const respuestaUsuario =
        respuestas[item.id];

      if (
        !respuestaUsuario ||
        respuestaUsuario.trim() === ""
      ) {

        openErrorModal(
          "Escribe una respuesta"
        );

        return;
      }

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/respuestas/crear/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            ejercicio: item.id,

            respuesta_usuario:
              respuestaUsuario,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "RESPUESTA BACKEND:",
        data
      );

      if (!response.ok) {

        openErrorModal(
          "No se pudo enviar respuesta"
        );

        return;
      }

      if (data.es_correcta) {

        openSuccessModal(
          "La respuesta es correcta ✅"
        );

      } else {

        openErrorModal(
          "La respuesta es incorrecta ❌"
        );
      }

      setRespuestas((prev) => ({
        ...prev,
        [item.id]: "",
      }));

      setEjercicios((prev) =>
        prev.filter(
          (ejercicio) =>
            ejercicio.id !== item.id
        )
      );

    } catch (error) {

      console.log(
        "ERROR ENVIANDO RESPUESTA:",
        error
      );

      openErrorModal(
        "Ocurrió un problema"
      );
    }
  };

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor:
            colors.background,
        }}
        contentContainerStyle={{
          padding: 20,
        }}
      >

        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 20,
            color: colors.text,
          }}
        >
          Panel de Estudiante
        </Text>

        {ejercicios.length === 0 && (
          <Text
            style={{
              color:
                colors.textMuted,
            }}
          >
            No hay ejercicios disponibles
          </Text>
        )}

        {ejercicios.map((item) => (
          <View
            key={item.id}
            style={{
              borderWidth: 1,

              borderColor:
                colors.border,

              borderRadius: 14,

              padding: 16,

              marginBottom: 20,

              backgroundColor:
                colors.card,
            }}
          >

            <Text
              style={{
                fontSize: 18,

                fontWeight: "bold",

                marginBottom: 10,

                color: colors.text,
              }}
            >
              {item.titulo}
            </Text>

            <Text
              style={{
                marginBottom: 15,

                color:
                  colors.textSecondary,
              }}
            >
              {item.descripcion}
            </Text>

            <TextInput
              placeholder="Escribe tu respuesta"

              placeholderTextColor={
                colors.textMuted
              }

              value={
                respuestas[item.id] ||
                ""
              }

              onChangeText={(text) =>
                setRespuestas(
                  (prev) => ({
                    ...prev,
                    [item.id]: text,
                  })
                )
              }

              style={{
                borderWidth: 1,

                borderColor:
                  colors.border,

                borderRadius: 10,

                padding: 12,

                marginBottom: 12,

                backgroundColor:
                  colors.surface,

                color: colors.text,
              }}
            />

            <TouchableOpacity
              onPress={() =>
                enviarRespuesta(item)
              }
              style={{
                backgroundColor:
                  colors.primary,

                padding: 14,

                borderRadius: 10,

                alignItems: "center",
              }}
            >

              <Text
                style={{
                  color: "#fff",

                  fontWeight: "bold",
                }}
              >
                Enviar Respuesta
              </Text>

            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>

      <CustomModal
        visible={showModal}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() =>
          setShowModal(false)
        }
      />
    </>
  );
}