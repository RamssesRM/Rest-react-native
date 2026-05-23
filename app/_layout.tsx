import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>  
      <QueryClientProvider client={queryClient}>
      <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
