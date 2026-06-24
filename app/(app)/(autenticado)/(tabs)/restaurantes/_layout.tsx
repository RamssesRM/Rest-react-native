import { Stack } from 'expo-router';

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' } }}>
      <Stack.Screen name="restaurantes" />
    </Stack>
  )
}

export default _layout