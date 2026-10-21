import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { createStyles } from "../styles/settings.styles";
import { useAuthStore } from "../store/authStore";
import { changePasswordRequest } from "../servicios/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();
  const styles = createStyles(colors);

  const navigation = useNavigation();
  const { logout, user } = useAuthStore();

  const [notifications, setNotifications] =
    useState(false);

  const [language, setLanguage] =
    useState("ES");

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showInfoModal, setShowInfoModal] =
    useState(false);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  const [currentPass, setCurrentPass] =
    useState("");

  const [newPass, setNewPass] =
    useState("");

  const [repeatPass, setRepeatPass] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showRepeat, setShowRepeat] =
    useState(false);

  const handleShowEmail = () => {
    setModalTitle("Correo electrónico");

    setModalMessage(
      user?.email || "No disponible"
    );

    setShowInfoModal(true);
  };

  const resetPasswordFields = () => {
    setCurrentPass("");
    setNewPass("");
    setRepeatPass("");

    setShowCurrent(false);
    setShowNew(false);
    setShowRepeat(false);
  };

  const openInfoModal = (
    title: string,
    message: string
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowInfoModal(true);
  };

  const handleChangePassword = async () => {
    if (
      !currentPass ||
      !newPass ||
      !repeatPass
    ) {
      openInfoModal(
        "Error",
        "Completa todos los campos"
      );
      return;
    }

    if (newPass !== repeatPass) {
      openInfoModal(
        "Error",
        "Las contraseñas no coinciden"
      );
      return;
    }

    try {
      await changePasswordRequest(
        currentPass,
        newPass
      );

      openInfoModal(
        "Éxito",
        "Contraseña actualizada correctamente"
      );

      resetPasswordFields();
      setShowPasswordModal(false);

    } catch (error: any) {
      openInfoModal(
        "Error",
        error.message ||
          "No se pudo cambiar la contraseña"
      );
    }
  };

  return (
    <SafeAreaView  style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>
          Opciones
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 22,
                }}
              >
                👤
              </Text>
            </View>

            <View>
              <Text style={styles.name}>
                {user?.username ||
                  "Usuario"}
              </Text>
            </View>
          </View>

          {/*<TouchableOpacity
            onPress={logout}
            style={{ padding: 8 }}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colors.primary}
            />*
          </TouchableOpacity>*/}
        </View>

        <Text style={styles.section}>
          APP
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate(
                "Libreria" as never
              )
            }
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="library-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.item}>
                Librería
              </Text>
            </View>
          </TouchableOpacity>
        </View>

{user && (
  <>
    <Text style={styles.section}>CUENTA</Text>

    <View style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={handleShowEmail}
      >
        <View style={styles.rowLeft}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.item}>
            Correo electrónico
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => setShowPasswordModal(true)}
      >
        <View style={styles.rowLeft}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.item}>
            Cambiar contraseña
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  </>
)}

        <Text style={styles.section}>
          PREFERENCIAS
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="moon-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.item}>
                Tema
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                true: colors.primary,
                false: colors.border,
              }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.item}>
                Notificaciones
              </Text>
            </View>

            <Switch
              value={notifications}
              onValueChange={
                setNotifications
              }
              trackColor={{
                true: colors.primary,
                false: colors.border,
              }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="language-outline"
                size={18}
                color={colors.primary}
              />

              <Text style={styles.item}>
                Idioma
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setLanguage(
                  language === "ES"
                    ? "EN"
                    : "ES"
                )
              }
            >
              <Text style={styles.value}>
                {language}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

{user && (
  <TouchableOpacity
    style={styles.logout}
    onPress={logout}
  >
    <Text style={styles.logoutText}>
      CERRAR SESIÓN
    </Text>
  </TouchableOpacity>
)}
      </ScrollView>

      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback
          onPress={() =>
            setShowInfoModal(false)
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
                  name="information-circle"
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
                  {modalTitle}
                </Text>

                <Text
                  style={{
                    color:
                      colors.textSecondary,
                    marginTop: 12,
                    fontSize: 16,
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  {modalMessage}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowInfoModal(false)
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
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowPasswordModal(false)
        }
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowPasswordModal(false);
            resetPasswordFields();
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor:
                colors.background + "CC",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor:
                    colors.card,
                  padding: 20,
                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 15,
                  }}
                >
                  Cambiar contraseña
                </Text>

                {[
                  {
                    placeholder:
                      "Contraseña actual",
                    setter:
                      setCurrentPass,
                    show: showCurrent,
                    toggle: () =>
                      setShowCurrent(
                        !showCurrent
                      ),
                  },
                  {
                    placeholder:
                      "Nueva contraseña",
                    setter: setNewPass,
                    show: showNew,
                    toggle: () =>
                      setShowNew(
                        !showNew
                      ),
                  },
                  {
                    placeholder:
                      "Repetir contraseña",
                    setter:
                      setRepeatPass,
                    show: showRepeat,
                    toggle: () =>
                      setShowRepeat(
                        !showRepeat
                      ),
                  },
                ].map((field, index) => (
                  <View
                    key={index}
                    style={
                      styles.inputContainer
                    }
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={
                        colors.textSecondary
                      }
                    />

                    <TextInput
                      placeholder={
                        field.placeholder
                      }
                      placeholderTextColor={
                        colors.textSecondary
                      }
                      secureTextEntry={
                        !field.show
                      }
                      style={styles.input}
                      onChangeText={
                        field.setter
                      }
                    />

                    <TouchableOpacity
                      onPress={
                        field.toggle
                      }
                    >
                      <Ionicons
                        name={
                          field.show
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={18}
                        color={
                          colors.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent:
                      "space-between",
                    marginTop: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordModal(
                        false
                      );

                      resetPasswordFields();
                    }}
                    style={{
                      flex: 1,
                      marginRight: 10,
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor:
                        colors.border,
                      alignItems:
                        "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          colors.text,
                      }}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={
                      handleChangePassword
                    }
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor:
                        colors.primary,
                      alignItems:
                        "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight:
                          "600",
                      }}
                    >
                      Guardar
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

</SafeAreaView>
  );
}