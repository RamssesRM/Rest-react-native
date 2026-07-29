import { BASE_URL } from '@/app/api/apiConfig';
import { apiClient, apiClientFormData } from '@/app/api/apiClient';
import {
  contarPendientes,
  eliminarDeCola,
  marcarError,
  obtenerCola,
} from '@/utils/offlineQueue';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

export const useOfflineQueue = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const actualizarConteo = async () => {
    const count = await contarPendientes();
    setPendingCount(count);
  };

  const syncPending = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const cola = await obtenerCola();
      if (cola.length === 0) {
        setIsSyncing(false);
        return;
      }

      let exitosas = 0;

      for (const peticion of cola) {
        try {
          let response;

          if (peticion.method === 'DELETE') {
            response = await apiClient(peticion.endpoint, {
              method: 'DELETE',
            });
          } else if (peticion.endpoint.includes('/productos/') && (peticion.method === 'POST' || peticion.method === 'PATCH')) {
            const formData = new FormData();
            if (peticion.body) {
              const body = JSON.parse(peticion.body);
              Object.keys(body).forEach((key) => {
                formData.append(key, body[key]);
              });
            }
            if (peticion.image_uri) {
              formData.append('imagen', {
                uri: peticion.image_uri,
                type: 'image/jpeg',
                name: 'imagen.jpg',
              } as any);
            }
            response = await apiClientFormData(peticion.endpoint, formData, peticion.method);
          } else {
            response = await apiClient(peticion.endpoint, {
              method: peticion.method,
              headers: { 'Content-Type': 'application/json' },
              body: peticion.body || undefined,
            });
          }

          if (response.ok) {
            await eliminarDeCola(peticion.id);
            exitosas++;
          } else {
            await marcarError(peticion.id);
          }
        } catch {
          await marcarError(peticion.id);
        }
      }

      await actualizarConteo();

      if (exitosas > 0) {
        Toast.show({
          type: 'success',
          text1: `${exitosas} cambio${exitosas > 1 ? 's' : ''} sincronizado${exitosas > 1 ? 's' : ''}`,
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    actualizarConteo();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPending();
      }
    });

    return () => unsubscribe();
  }, []);

  return { pendingCount, isSyncing, syncPending, actualizarConteo };
};
