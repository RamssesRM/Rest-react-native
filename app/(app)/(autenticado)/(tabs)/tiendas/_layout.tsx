import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' } }}>
      <Stack.Screen name="tiendas" />
    </Stack>
  )
}

export default _layout