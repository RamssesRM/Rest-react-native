import { Stack } from "expo-router";
const RootNav = () => {
  // const { isGuest, user } = useAuth(); Hay que hacer la conexion con la base de datos relacional para iniciar sesion con el usuario registrado o como invitado
  return (
    <Stack>
      {/* <Stack.Protected guard = {isGuest || user}> */}
      <Stack.Protected guard = {false}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      
      {/* <Stack.Protected guard = {!isGuest && !user}> */}
      <Stack.Protected guard = {false}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};
export default RootNav;
