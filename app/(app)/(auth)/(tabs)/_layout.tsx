import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from 'react';
import { useTheme } from "@/hooks/use-theme";

const Layout = () => {
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle:{
        fontSize:9,
        fontWeight:'600'
      }
    }}>
      <Tabs.Screen name="comentarios" options={{ 
        title: "Comentarios",
        headerShown: false,
        tabBarIcon:({color, size, focused}) => (
          <Ionicons name={focused ? "chatbubble" : 'chatbubble-outline'} color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="comidas" options={{ 
        title: "Menús",
        headerShown: false,
        tabBarIcon:({color, size}) => (
          <MaterialIcons name="restaurant" color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="comandas" options={{ 
        title: "Comandas", 
        headerShown: false,
        tabBarIcon:({color, size, focused}) => (
          <FontAwesome5 name={focused ? "receipt" : 'clipboard-list'} color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="sobre-nosotros" options={{ 
        title: "Sobre Nosotros",
        headerShown: false,
        tabBarIcon:({color, size, focused}) => (
          <Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="perfil" options={{ 
        title: "Perfil",
        headerShown: false,
        tabBarIcon:({color, size}) => (
          <Ionicons name='person' color={color} size={size} />
        ),
      }} />
    </Tabs>
  );
};
export default Layout;
