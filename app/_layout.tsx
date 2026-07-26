import { openDatabase } from "@/src/db/database";
import {
  Nunito_400Regular,
  Nunito_700Bold_Italic,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/hooks/use-theme";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1, // Reintentar una vez en caso de error
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold_Italic,
    Nunito_900Black,
  });

  // Estado para saber si la base de datos está lista
  const [dbReady, setDbReady] = useState(false);

  // Inicializar SQLite al arrancar la app
  useEffect(() => {
    openDatabase()
      .then(() => setDbReady(true))
      .catch((error) => console.error("Error al inicializar BD en _layout:", error));
  }, []);

  // Esperar a que carguen fuentes y base de datos local
  if (!fontsLoaded || !dbReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}