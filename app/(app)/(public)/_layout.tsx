import { Stack } from "expo-router";
const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      />
      <Stack.Screen
        name="otras-opciones"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          title: '',
          sheetAllowedDetents: [0.6],
          sheetGrabberVisible: true,
          sheetCornerRadius: 16,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
};
export default Layout;
