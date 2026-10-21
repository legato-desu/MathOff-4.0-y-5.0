export const learningData: any = {
  lineal: {
    title: "Funciones lineales",

    theory:
      "Una función lineal describe una relación de cambio constante entre dos variables. Su gráfica es una línea recta. Se utiliza para modelar situaciones donde una cantidad aumenta o disminuye de forma uniforme.",

    formula: "y = mx + b",

    explanation:
      "m representa la pendiente (qué tan inclinada es la recta) y b es el punto donde la recta corta el eje Y. Si m es positiva, la función crece; si es negativa, decrece.",

    example:
      "y = 2x + 1 → por cada aumento de 1 en x, y aumenta 2. Cuando x = 0, y = 1.",

    realLife:
      "Ejemplo real: si ganas $2 por cada producto vendido y tienes una base de $1, tus ingresos siguen esta función.",

    tips:
      "Identifica siempre la pendiente y el punto de inicio. Esto te permite dibujar la recta fácilmente.",
  },

  cuadratica: {
    title: "Ecuaciones cuadráticas",

    theory:
      "Las funciones cuadráticas representan relaciones donde el cambio no es constante. Su gráfica es una parábola que puede abrir hacia arriba o hacia abajo.",

    formula: "y = ax² + bx + c",

    explanation:
      "El valor de 'a' determina la apertura de la parábola. Si a > 0 abre hacia arriba, si a < 0 abre hacia abajo. El vértice es el punto más alto o más bajo de la gráfica.",

    example:
      "y = x² - 4 → es una parábola que abre hacia arriba y corta el eje Y en -4.",

    realLife:
      "Ejemplo real: el movimiento de una pelota lanzada al aire sigue una trayectoria parabólica.",

    tips:
      "Busca el vértice y los puntos donde cruza el eje X para entender la forma de la parábola.",
  },

  trigonometria: {
    title: "Trigonometría",

    theory:
      "La trigonometría estudia las relaciones entre los ángulos y los lados de los triángulos. Las funciones seno, coseno y tangente son fundamentales.",

    formula: "sin(x), cos(x), tan(x)",

    explanation:
      "El seno y coseno describen movimientos ondulatorios. El coseno empieza en su valor máximo, mientras que el seno empieza en cero.",

    example:
      "y = sin(x) → produce una onda suave que oscila entre -1 y 1.",

    realLife:
      "Ejemplo real: se usa para modelar ondas de sonido, luz y movimiento circular.",

    tips:
      "Aprende el círculo unitario, es la base de toda la trigonometría.",
  },

  calculo: {
    title: "Cálculo básico",

    theory:
      "El cálculo estudia el cambio y la acumulación. Se divide principalmente en derivadas (cambio instantáneo) e integrales (acumulación).",

    formula: "f'(x), ∫f(x)dx",

    explanation:
      "La derivada mide la velocidad de cambio de una función en un punto. La integral mide el área bajo la curva.",

    example:
      "Si f(x) = x², entonces f'(x) = 2x.",

    realLife:
      "Ejemplo real: calcular velocidad en física o áreas en ingeniería.",

    tips:
      "Piensa en la derivada como velocidad y la integral como acumulación.",
  },

  comandos: {
    title: "Guía de comandos",

    image: require("../../assets/lineal.png"),

    theory:
      "Esta guía explica cómo escribir correctamente las funciones matemáticas usando el teclado del graficador.",

    formula:
      "x² → x^2 | √x → sqrt(x) | seno → sin(x)",

    explanation:
      "Debes escribir las funciones usando símbolos especiales del teclado. Algunas operaciones necesitan paréntesis para funcionar correctamente.",

    example:
      "Ejemplos:\n\nx^2 → x al cuadrado\nx^3 → x al cubo\nsin(x) → función seno\ncos(x) → función coseno\ntan(x) → función tangente\nsqrt(x) → raíz cuadrada\n(x+1)^2 → binomio al cuadrado",

    realLife:
      "Estas expresiones permiten representar funciones usadas en matemáticas, física e ingeniería.",

    tips:
      "• Usa ^ para potencias\n• Usa √ para raíces\n• Usa paréntesis en funciones\n• Multiplica con * si es necesario\n• Escribe sin(x), cos(x) y tan(x)\n• Usa puntos para decimales\n• Usa π para trabajar con pi",
  },
};
