import { Tabs } from "expo-router";

const Layout = () => {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarLabelStyle:{
        fontSize:9,
        fontWeight:'600'
      }
    }}>
      <Tabs.Screen name="descubrir" options={{ title: "Descubrir" }} />
      {/* 1. Esta pantalla mapea el archivo index.tsx de la raíz de (tabs) y será "Comidas" */}
      <Tabs.Screen name="index" options={{ title: "Comidas" }} />
      {/* 2. Rutas directas sin el '/index' para que coincidan con lo que busca Expo */}
      <Tabs.Screen name="tiendas" options={{ title: "Tiendas" }} />
      <Tabs.Screen name="buscar" options={{ title: "Buscar" }} />
      <Tabs.Screen name="comandas" options={{ title: "Comandas", headerShown: false }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
};
export default Layout;
