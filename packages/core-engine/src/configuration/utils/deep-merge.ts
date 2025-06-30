/**
 * Realiza merge profundo de objetos, dando precedência aos valores do segundo objeto
 *
 * @param target - Objeto base
 * @param source - Objeto com valores para sobrescrever/adicionar
 * @returns Novo objeto com valores mesclados
 */
export function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
): any {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        // Merge recursivo para objetos
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        // Sobrescrever com valor do source se não for undefined
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Verifica se um valor é um objeto plano (não array, não null, não Date, etc.)
 */
function isObject(value: any): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp)
  );
}
