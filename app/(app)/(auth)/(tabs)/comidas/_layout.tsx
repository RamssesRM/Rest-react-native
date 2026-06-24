import { Stack } from 'expo-router';

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' }, headerShown: false }}>
      <Stack.Screen name="index" options={{ 
        headerShown: false, // <-- Ocultamos el header nativo de Android
        headerLargeTitle:true,
        headerTransparent : true
      }} />
    </Stack>
  );
};

export default _layout