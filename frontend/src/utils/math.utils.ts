import { compile } from "mathjs";

export const parseExpression = (
  expr: string
): string => {

  let parsed = expr;

  parsed = parsed
    .replace(/π/g, "pi")
    .replace(/ln/g, "log")
    .replace(/√/g, "sqrt")
    .replace(/\^/g, "^");

  parsed = parsed
    .replace(/(\d)(x)/g, "$1*x")
    .replace(/(\d)\(/g, "$1*(")
    .replace(/(\))(x)/g, "$1*x");

  return parsed;
};

export const evaluateExpression = (
  expr: string
): {
  fn: ((x: number) => number) | null;
  error: string | null;
} => {

  try {

    if (!expr.trim()) {

      return {
        fn: null,
        error: "Escribe una función"
      };
    }

    const parsed =
      parseExpression(expr);

    const compiled =
      compile(parsed);

    const fn = (x: number) => {

      const result =
        compiled.evaluate({ x });

      if (
        typeof result !== "number" ||
        isNaN(result)
      ) {

        throw new Error();
      }

      return result;
    };

    fn(1);

    return {
      fn,
      error: null
    };

  } catch {

    return {
      fn: null,
      error: "Expresión inválida"
    };
  }
};