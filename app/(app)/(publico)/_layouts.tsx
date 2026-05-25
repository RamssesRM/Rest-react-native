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
    </Stack>
  );
};
export default Layout;
