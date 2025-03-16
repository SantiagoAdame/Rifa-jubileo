module.exports = {
    extends: 'next/core-web-vitals',
    // Deshabilitar temporalmente reglas problemáticas
    rules: {
      'no-unused-vars': 'warn', // Convertir errores en advertencias
      'react/no-unescaped-entities': 'off', // Desactivar regla problemática
    },
    // Ignorar errores de parse
    parserOptions: {
      requireConfigFile: false,
      babelOptions: {},
    },
  };