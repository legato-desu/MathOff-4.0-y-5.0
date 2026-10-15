import { API_URL } from "../servicios/config";
import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";

export default function RespuestasScreen() {

  const { colors } = useTheme();

  const [respuestas, setRespuestas] =
    useState<any[]>([]);

  useEffect(() => {
    cargarRespuestas();
  }, []);

  const cargarRespuestas = async () => {

    try {

      const token =
        await AsyncStorage.getItem(
          "accessToken"
        );

      const response = await fetch(
        `${API_URL}/respuestas/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setRespuestas(data);
      }

    } catch (error) {

      console.log(
        "ERROR RESPUESTAS:",
        error
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
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Respuestas de Estudiantes
      </Text>

      {respuestas.map((item) => (

        <View
          key={item.id}
          style={{
            backgroundColor:
              colors.card,

            padding: 15,
            borderRadius: 12,
            marginBottom: 15,
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
            {item.ejercicio_titulo}
          </Text>

          <Text
            style={{
              color:
                colors.textSecondary,
              marginTop: 5,
            }}
          >
            Estudiante:
            {" "}
            {item.estudiante_nombre}
          </Text>

          <Text
            style={{
              color: colors.text,
              marginTop: 10,
            }}
          >
            Respuesta:
            {" "}
            {item.respuesta_usuario}
          </Text>

          <Text
            style={{
              marginTop: 10,

              color: item.es_correcta
                ? "#22c55e"
                : "#ef4444",

              fontWeight: "bold",
            }}
          >
            {item.es_correcta
              ? "Correcta ✅"
              : "Incorrecta ❌"}
          </Text>

        </View>
      ))}
    </ScrollView>
  );
}