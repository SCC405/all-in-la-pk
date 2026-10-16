import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sesionServicio } from '../services/sesionServicio.js';
import { ESTADO_INICIAL_SESION, FASES, sesionDesdeRespuesta } from '../utils/sesion.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [estado, setEstado] = useState(ESTADO_INICIAL_SESION);

  // Al arrancar se pregunta al servidor si la cookie sigue valiendo. Es la
  // única forma de saberlo: la cookie es httpOnly y desde aquí no se ve.
  useEffect(() => {
    let vigente = true;

    sesionServicio
      .consultar()
      .then((respuesta) => {
        if (vigente) setEstado(sesionDesdeRespuesta(respuesta));
      })
      .catch(() => {
        // Ante la duda, no hay sesión: más vale pedir login de más que enseñar
        // el panel a quien no debe.
        if (vigente) setEstado(sesionDesdeRespuesta(null));
      });

    return () => {
      vigente = false;
    };
  }, []);

  const entrar = useCallback(async (credenciales) => {
    const respuesta = await sesionServicio.entrar(credenciales);
    setEstado({ fase: FASES.ACTIVA, usuario: respuesta?.usuario ?? null });
    return respuesta;
  }, []);

  const salir = useCallback(async () => {
    try {
      await sesionServicio.salir();
    } finally {
      // Aunque la llamada falle, aquí se da por cerrada: lo contrario dejaría
      // al administrador viendo un panel que ya no puede usar.
      setEstado({ fase: FASES.INACTIVA, usuario: null });
    }
  }, []);

  const valor = useMemo(
    () => ({
      fase: estado.fase,
      usuario: estado.usuario,
      comprobando: estado.fase === FASES.COMPROBANDO,
      activa: estado.fase === FASES.ACTIVA,
      entrar,
      salir,
    }),
    [entrar, estado.fase, estado.usuario, salir],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const contexto = useContext(SesionContext);

  if (!contexto) {
    throw new Error('useSesion debe utilizarse dentro de SesionProvider.');
  }

  return contexto;
}
