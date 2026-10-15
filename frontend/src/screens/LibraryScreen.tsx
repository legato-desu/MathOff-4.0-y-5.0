import React from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SavedGraphCard from "../components/SavedGraphCard";
import { useTheme } from "../theme/ThemeContext";
import { getStyles } from "../styles/library.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScanStore } from "../store/scanStore";
import { useAuthStore } from "../store/authStore";

type NavigationProp = NativeStackNavigationProp<any>;

export default function LibraryScreen() {

  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);

const imagesByUser = useScanStore(
  (state) => state.imagesByUser
);

const images = user?.user_id
  ? imagesByUser[user.user_id] || []
  : [];
  const learningItems = [
    {
      title: "Guía de comandos",
      desc: "Cómo escribir funciones en el teclado",
      icon: "book-outline",
      type: "comandos"
    },
    {
      title: "Funciones lineales",
      desc: "Pendiente, intersecciones, y=mx+b",
      icon: "trending-up-outline",
      type: "lineal"
    },
    {
      title: "Ecuaciones cuadráticas",
      desc: "Parábolas, raíces y factorización",
      icon: "analytics-outline",
      type: "cuadratica"
    },
    {
      title: "Trigonometría",
      desc: "Seno, coseno y círculo unitario",
      icon: "pulse-outline",
      type: "trigonometria"
    },
    {
      title: "Cálculo básico",
      desc: "Límites, derivadas e integrales",
      icon: "calculator-outline",
      type: "calculo"
    },
    

  ];

  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.content}>

        <View style={styles.headerContainer}>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.header}>
            Librería
          </Text>

        </View>

      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.content}>

          <View style={styles.tabsContainer}>
            <Text style={styles.activeTab}>
              Historial
            </Text>
          </View>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Gráficos Guardados
            </Text>

            <Text style={styles.viewAll}>
              Ver todos
            </Text>

          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            {images.length === 0 ? (

              <SavedGraphCard title="No hay imágenes" />

            ) : (

              images.map((item) => (

                <View
                  key={item.id}
                  style={{
                    width: 140,
                    height: 120,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginRight: 12,
                    backgroundColor: "#123",
                  }}
                >

                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    resizeMode="cover"
                  />

                </View>

              ))
            )}

          </ScrollView>

          <Text style={styles.quickLearnTitle}>
            Aprendizaje rápido
          </Text>

          {learningItems.map((item, index) => (

            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                navigation.navigate("LearnDetail", {
                  type: item.type
                })
              }
            >

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >

                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 10 }}
                />

                <View>

                  <Text style={styles.cardTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    {item.desc}
                  </Text>

                </View>

              </View>

            </TouchableOpacity>

          ))}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}