import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' } }}>
      <Stack.Screen name="index" options={{ 
        headerShown: false // <-- Ocultamos el header nativo de Android
      }} />
    </Stack>
  );
};

export default _layout;