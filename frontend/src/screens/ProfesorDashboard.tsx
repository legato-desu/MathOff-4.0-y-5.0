import { API_URL } from "../servicios/config";
import React, {
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
import { useNavigation } from "@react-navigation/native";
import CustomModal from "../components/CustomModal";

export default function ProfesorDashboard() {

  const { colors } = useTheme();

  const navigation =
    useNavigation<any>();

  const [titulo, setTitulo] =
    useState("");

  const [descripcion,
    setDescripcion] =
    useState("");

  const [funcionCorrecta,
    setFuncionCorrecta] =
    useState("");

  const [showModal,
    setShowModal] =
    useState(false);

  const [modalTitle,
    setModalTitle] =
    useState("");

  const [modalMessage,
    setModalMessage] =
    useState("");

  const [modalType,
    setModalType] =
    useState<
      "success" |
      "error" |
      "warning"
    >("success");

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

  const crearEjercicio =
    async () => {

    try {

      if (
        !titulo ||
        !descripcion ||
        !funcionCorrecta
      ) {

        openErrorModal(
          "Completa todos los campos"
        );

        return;
      }

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/ejercicios/`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            titulo,
            descripcion,

            funcion_correcta:
              funcionCorrecta,
          }),
        }
      );

      if (!response.ok) {

  const errorData =
    await response.json();

  console.log(
    "ERROR BACKEND:",
    errorData
  );

  openErrorModal(
    errorData.detail ||
    JSON.stringify(errorData)
  );

  return;
}

      openSuccessModal(
        "Ejercicio creado correctamente"
      );

      setTitulo("");

      setDescripcion("");

      setFuncionCorrecta("");

    } catch (error) {

      console.log(
        "ERROR CREANDO:",
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
            fontSize: 24,

            fontWeight: "bold",

            marginBottom: 20,

            color: colors.text,
          }}
        >
          Panel de Profesor
        </Text>

        <TextInput
          placeholder="Título del ejercicio"

          placeholderTextColor={
            colors.textMuted
          }

          value={titulo}

          onChangeText={setTitulo}

          style={{
            borderWidth: 1,

            borderColor:
              colors.border,

            padding: 12,

            marginBottom: 15,

            borderRadius: 10,

            backgroundColor:
              colors.surface,

            color: colors.text,
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
            borderWidth: 1,

            borderColor:
              colors.border,

            padding: 12,

            marginBottom: 15,

            borderRadius: 10,

            minHeight: 100,

            backgroundColor:
              colors.surface,

            color: colors.text,
          }}
        />

        <TextInput
          placeholder="Función correcta"

          placeholderTextColor={
            colors.textMuted
          }

          value={funcionCorrecta}

          onChangeText={
            setFuncionCorrecta
          }

          style={{
            borderWidth: 1,

            borderColor:
              colors.border,

            padding: 12,

            marginBottom: 20,

            borderRadius: 10,

            backgroundColor:
              colors.surface,

            color: colors.text,
          }}
        />

        <TouchableOpacity
          onPress={crearEjercicio}
          style={{
            backgroundColor:
              colors.secondary,

            padding: 15,

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
            Crear Ejercicio
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "Respuestas"
            )
          }
          style={{
            backgroundColor:
              colors.primary,

            padding: 15,

            borderRadius: 10,

            alignItems: "center",

            marginTop: 15,
          }}
        >

          <Text
            style={{
              color: "#fff",

              fontWeight: "bold",
            }}
          >
            Ver Respuestas
          </Text>

        </TouchableOpacity>

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