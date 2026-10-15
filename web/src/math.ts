import { compile } from 'mathjs';

export function parseExpression(expression: string): string {
  return expression.trim()
    .replace(/^\s*(?:y|f\(x\))\s*=\s*/i, '')
    .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/ln/g, 'log')
    .replace(/(\d)(x)/gi, '$1*x').replace(/(\d)\(/g, '$1*(')
    .replace(/\)(x)/gi, ')*x');
}

export function compileFunction(expression: string): (x: number) => number {
  if (!expression.trim()) throw new Error('Escribe una función.');
  const compiled = compile(parseExpression(expression));
  const fn = (x: number) => {
    const result = compiled.evaluate({ x });
    if (typeof result !== 'number' || Number.isNaN(result)) throw new Error('Expresión inválida.');
    return result;
  };
  fn(1);
  return fn;
}
