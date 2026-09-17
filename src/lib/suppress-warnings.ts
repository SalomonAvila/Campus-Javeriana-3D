/**
 * Three.js (a partir de r183) depreca `THREE.Clock` a favor de `THREE.Timer`.
 * Sin embargo, `@react-three/fiber` (R3F v9) aún instancia internamente `new THREE.Clock()`
 * al inicializar el `<Canvas>`.
 *
 * Este filtro intercepta exclusivamente esa advertencia de deprecación en el navegador
 * para mantener la consola limpia hasta que R3F migre oficialmente en su v10.
 */
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
