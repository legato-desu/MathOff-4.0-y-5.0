export const getRoleStyles = (role: string | null) => {
  switch (role) {
    case "Administrador":
      return {
        accent: "#FF4D4D",
        label: "ADMIN",
        icon: "shield-checkmark"
      };

    case "Docente":
      return {
        accent: "#00A859",
        label: "DOCENTE",
        icon: "school"
      };

    case "Estudiante":
      return {
        accent: "#007AFF",
        label: "ESTUDIANTE",
        icon: "person"
      };

    default:
      return {
        accent: "#999",
        label: "USUARIO",
        icon: "person"
      };
  }
};