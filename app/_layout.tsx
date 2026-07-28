import { ThemeProvider } from "@/hooks/use-theme";
import { openDatabase } from "@/src/db/database";
import { validateStoredTokens } from "@/utils/auth";
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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    }
  }
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold_Italic,
    Nunito_900Black,
  });

  const [dbReady, setDbReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await openDatabase();
        setDbReady(true);
        await validateStoredTokens();
        setAuthChecked(true);
      } catch (error) {
        console.error("Error al inicializar:", error);
        setDbReady(true);
        setAuthChecked(true);
      }
    };
    init();
  }, []);

  if (!fontsLoaded || !dbReady || !authChecked) {
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