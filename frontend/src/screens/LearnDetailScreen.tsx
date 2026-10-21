import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { learningData } from "../data/learningData";
import { useTheme } from "../theme/ThemeContext";

export default function LearnDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params as any;

  const { colors } = useTheme();

  const data = learningData[type];

  if (!data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 20
        }}
      >
        <Text style={{ color: colors.text }}>
          No hay información
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: 15 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: colors.primary
        }}
      >
        {data.title}
      </Text>

      {type === "lineal" && (
        <Image
          source={require("../../assets/lineal.png")}
          style={{
            width: "100%",
            height: 200,
            marginTop: 15,
            borderRadius: 12,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />
      )}

      {type === "cuadratica" && (
        <Image
          source={require("../../assets/cuadratica.jpg")}
          style={{
            width: "100%",
            height: 200,
            marginTop: 15,
            borderRadius: 12,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />
      )}

      {type === "trigonometria" && (
        <Image
          source={require("../../assets/seno.jpg")}
          style={{
            width: "100%",
            height: 200,
            marginTop: 15,
            borderRadius: 12,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />
      )}

      {type === "calculo" && (
        <Image
          source={require("../../assets/derivada.png")}
          style={{
            width: "100%",
            height: 200,
            marginTop: 15,
            borderRadius: 12,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />
      )}

      {type === "comandos" && (
        <Image
          source={require("../../assets/comandos.png")}
          style={{
            width: "100%",
            height: 200,
            marginTop: 15,
            borderRadius: 12,
            alignSelf: "center"
          }}
          resizeMode="contain"
        />
      )}

      {}

      <Text style={{ marginTop: 15, color: colors.text }}>
        {data.theory}
      </Text>

      <Text
        style={{
          marginTop: 15,
          fontWeight: "bold",
          color: colors.primary
        }}
      >
        Fórmula:
      </Text>

      <Text style={{ color: colors.text }}>
        {data.formula}
      </Text>

      <Text style={{ marginTop: 15, color: colors.text }}>
        {data.explanation}
      </Text>

      <Text
        style={{
          marginTop: 15,
          fontWeight: "bold",
          color: colors.primary
        }}
      >
        Ejemplo:
      </Text>

      <Text style={{ color: colors.text }}>
        {data.example}
      </Text>

      <Text
        style={{
          marginTop: 15,
          fontWeight: "bold",
          color: colors.primary
        }}
      >
        Aplicación en la vida real:
      </Text>

      <Text style={{ color: colors.text }}>
        {data.realLife}
      </Text>

      <Text
        style={{
          marginTop: 15,
          fontWeight: "bold",
          color: colors.primary
        }}
      >
        Tip:
      </Text>

      <Text style={{ color: colors.text }}>
        {data.tips}
      </Text>

    </ScrollView>
  );
}