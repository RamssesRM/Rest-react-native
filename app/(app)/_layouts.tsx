import useUserStore from '@/hooks/use-userstore';
import { Stack } from "expo-router";

const RootNav = () => {
  const { isGuest, user } = useUserStore();
  return (
    <Stack>
      <Stack.Protected guard = {isGuest || user}>
        <Stack.Screen name="(autenticado)/index" options={{ headerShown: false }} />
      </Stack.Protected>
      
      <Stack.Protected guard = {!isGuest && !user}>
        <Stack.Screen name="(publico)/index" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};
export default RootNav;
