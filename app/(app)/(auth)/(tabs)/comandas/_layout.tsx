import { Stack } from 'expo-router';

const _layout = () => {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor:'#fff' }, headerShown: false }}>
      <Stack.Screen name="index" options={{ 
        headerLargeTitle:true,
        headerTransparent : true
      }} />
    </Stack>
  );
};

export default _layout