import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import createStyles from "../styles/home.styles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const styles = createStyles(colors, isDark);

  const goToGraph = () => {
    navigation.navigate("Tabs", { screen: "Grafico" });
  };

  const gradientColors = isDark
    ? ["#0D2A36", "#071A24"]
    : ["#EAF6FF", "#FFFFFF"];

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>✦ MathOff</Text>
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={goToGraph}>
        <LinearGradient
          colors={gradientColors as [string, string]}
          style={styles.heroCard}
        >
          <Image
            source={require("../../assets/graficador.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.overlay} />

        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>
          Domina las <Text style={styles.primary}>Matemáticas</Text> en Tiempo Real
        </Text>

        <Text style={styles.subtitle}>
          ¡GRÁFICA FUNCIONES COMPLEJAS!
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Proyecto de investigación que busca facilitar la comprensión y el análisis de ecuaciones matemáticas, mediante una herramienta capaz de reconocer escritura a mano a través de una cámara mostrando su respectiva gráfica, de igual manera escanea ecuaciones y aprende de forma interactiva.
        </Text>

        <TouchableOpacity style={styles.button} onPress={goToGraph}>
          <Text style={styles.buttonText}>COMENZAR AHORA →</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}