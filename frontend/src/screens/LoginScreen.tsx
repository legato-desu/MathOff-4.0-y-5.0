import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Ionicons } from "@expo/vector-icons";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { createStyles } from "../styles/login.styles";
import { loginRequest } from "../servicios/api";
import { useAuthStore } from "../store/authStore";
import RegisterScreen from "./RegisterScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const loadUser = async () => {
      const saved = await AsyncStorage.getItem("username");

      if (saved) {
        setUsername(saved);
        setRemember(true);
      }
    };

    loadUser();
  }, []);

  const openErrorModal = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleLogin = async () => {

    if (!username || !password) {

      openErrorModal(
        "Completa todos los campos"
      );

      return;
    }

    try {

      const data =
        await loginRequest(
          username,
          password
        );

      await AsyncStorage.setItem(
        "accessToken",
        data.token
      );

      await AsyncStorage.setItem(
        "refreshToken",
        data.refresh
      );

      login(
        data.token,
        data.user
      );

      if (remember) {

        await AsyncStorage.setItem(
          "username",
          username
        );

      } else {

        await AsyncStorage.removeItem(
          "username"
        );
      }

    } catch (error: any) {

      console.log(
        "ERROR LOGIN:",
        error
      );

      openErrorModal(
        error.message ||
        "Error al iniciar sesión"
      );
    }
  };

  if (isRegistering) {
    return (
      <RegisterScreen
        onBack={() =>
          setIsRegistering(false)
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.logoBox}>
        <Image
          source={logo}
          style={styles.logoImage}
        />
      </View>

      <Text style={styles.title}>
        MathOff
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          placeholder="Usuario"
          placeholderTextColor={
            colors.textSecondary
          }
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={colors.textSecondary}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={
            colors.textSecondary
          }
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={() =>
            setShowPassword(!showPassword)
          }
        >
          <Ionicons
            name={
              showPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setRemember(!remember)
          }
        >
          <Ionicons
            name={
              remember
                ? "checkbox"
                : "square-outline"
            }
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text
          style={{
            marginLeft: 8,
            color: colors.text,
          }}
        >
          Recordarme
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          INICIAR
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        No tienes cuenta?{" "}
        <Text
          style={styles.link}
          onPress={() =>
            setIsRegistering(true)
          }
        >
          Registrarse
        </Text>
      </Text>

      {/* MODAL ERROR */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setShowErrorModal(false)
          }
        >
          <View
            style={{
              flex: 1,
              backgroundColor:
                "rgba(0,0,0,0.6)",
              justifyContent: "center",
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
                  name="alert-circle"
                  size={60}
                  color={colors.primary}
                />

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 22,
                    fontWeight: "bold",
                    marginTop: 15,
                  }}
                >
                  Error
                </Text>

                <Text
                  style={{
                    color:
                      colors.textSecondary,
                    textAlign: "center",
                    marginTop: 10,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {errorMessage}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowErrorModal(false)
                  }
                  style={{
                    marginTop: 25,
                    backgroundColor:
                      colors.primary,
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

    </SafeAreaView>
  );
}
