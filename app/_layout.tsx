import { openDatabase } from "@/src/db/database"; // ✅ 2. Importamos la apertura de la BD
import {
  Nunito_400Regular,
  Nunito_700Bold_Italic,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect, useState } from "react"; // ✅ 1. Importamos useState y useEffect
import { GestureHandlerRootView } from "react-native-gesture-handler";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1, // Reintentar una vez en caso de error
    }
  }
});

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold_Italic,
    Nunito_900Black,
  });

  // ✅ 3. Creamos el estado para saber si la BD está lista
  const [dbReady, setDbReady] = useState(false);

  // ✅ 4. Abrimos la base de datos una sola vez al arrancar la app
  useEffect(() => {
    const initDB = async () => {
      try {
        await openDatabase();
        setDbReady(true);
      } catch (error) {
        console.error("Error al inicializar BD en _layout:", error);
      }
    };
    initDB();
  }, []);

  // ✅ 5. Esperamos tanto a las fuentes como a la Base de Datos
  if (!fontsLoaded || !dbReady) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}