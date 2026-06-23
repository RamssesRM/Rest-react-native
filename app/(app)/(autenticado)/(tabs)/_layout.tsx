import { Tabs } from "expo-router";

const Layout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="restaurantes/index"
        options={{ title: "Comidas", headerShown: false }}
      />
      <Tabs.Screen
        name="descubrir"
        options={{ title: "Descubrir", headerShown: false }}
      />
      <Tabs.Screen
        name="tiendas/index"
        options={{ title: "Tiendas", headerShown: false }}
      />
      <Tabs.Screen
        name="buscar"
        options={{ title: "Buscar", headerShown: false }}
      />
      <Tabs.Screen
        name="perfil/index.tsx"
        options={{ title: "Perfil", headerShown: false }}
      />
    </Tabs>
  );
};
export default Layout;
