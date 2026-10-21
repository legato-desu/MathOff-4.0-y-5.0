import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "./config";

export const normalizeRole = (
  role: string | null | undefined
): string | null => {
  const normalized = (role ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  switch (normalized) {
    case "root":
    case "superusuario":
      return "Root";

    case "admin":
    case "administrador":
      return "Administrador";

    case "docente":
    case "profesor":
      return "Docente";

    case "estudiante":
      return "Estudiante";

    default:
      return null;
  }
};

export const loginRequest = async (
  username: string,
  password: string
) => {

  try {

    const response = await fetch(
      `${API_URL}/token/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Error al iniciar sesión"
      );
    }

    await AsyncStorage.setItem(
      "accessToken",
      data.access
    );

    await AsyncStorage.setItem(
      "refreshToken",
      data.refresh
    );

    return {

      token: data.access,

      refresh: data.refresh,

      user: {
        username: data.username,
        email: data.email,
        role: normalizeRole(data.role),
        user_id: data.user_id,
      },
    };

  } catch (error: any) {

    console.log("ERROR LOGIN:", error);
    throw new Error(error.message);
  }
};



export const refreshAccessToken = async () => {

  try {

    const refreshToken =
      await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(
      `${API_URL}/token/refresh/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    await AsyncStorage.setItem(
      "accessToken",
      data.access
    );

    return data.access;

  } catch (error) {

    console.log("ERROR REFRESH TOKEN:", error);
    return null;
  }
};


export const authFetch = async (
  endpoint: string,
  options: RequestInit = {},
  isMultipart = false
) => {

  let token =
    await AsyncStorage.getItem("accessToken");

  let response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...(isMultipart ? {} : { "Content-Type": "application/json" }),

        Authorization: `Bearer ${token}`,

        ...(options.headers || {}),
      },
    }
  );

  if (response.status === 401) {

    console.log(
      "TOKEN EXPIRADO → intentando refresh..."
    );

    const newAccessToken =
      await refreshAccessToken();

    if (newAccessToken) {

      response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,

          headers: {
            ...(isMultipart ? {} : { "Content-Type": "application/json" }),

            Authorization:
              `Bearer ${newAccessToken}`,

            ...(options.headers || {}),
          },
        }
      );

      return response;
    }

    const logout =
      useAuthStore.getState().logout;

    await logout();

    throw new Error(
      "Sesión expirada. Inicia sesión nuevamente."
    );
  }

  if (response.status === 403) {

    throw new Error(
      "No tienes permisos para acceder."
    );
  }

  return response;
};

export const scanEquationRequest = async (photoUri: string) => {
  const form = new FormData();
  if (photoUri.startsWith("data:")) {
    const response = await fetch(photoUri);
    form.append("image", await response.blob(), "equation.jpg");
  } else {
    form.append("image", {
      uri: photoUri,
      name: "equation.jpg",
      type: "image/jpeg",
    } as any);
  }
  const response = await authFetch("/math/scan/", { method: "POST", body: form }, true);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "No se pudo leer la ecuación.");
  return data as { raw_text: string; expression: string; message: string };
};


export const registerRequest = async (
  username: string,
  email: string,
  password: string
) => {

  try {

    const response = await fetch(
      `${API_URL}/register/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.detail || "Error en registro"
      );
    }

    return data;

  } catch (error: any) {

    console.log("ERROR REGISTER:", error);
    throw new Error(error.message);
  }
};

export const changePasswordRequest = async (
  currentPassword: string,
  newPassword: string
) => {

  try {

    const response = await authFetch(
      "/users/change-password/",
      {
        method: "POST",

        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }
    );

    const data = await response.json();

    console.log(
      "CHANGE PASSWORD RESPONSE:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data.detail ||
        "Error cambiando contraseña"
      );
    }

    return data;

  } catch (error: any) {

    console.log(
      "ERROR CHANGE PASSWORD:",
      error
    );

    throw new Error(error.message);
  }
};
