import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from 'react';

const Layout = () => {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarLabelStyle:{
        fontSize:9,
        fontWeight:'600'
      }
    }}>
      {/* 1. Esta pantalla mapea el archivo index.tsx de la raíz de (tabs) y será "Comidas" */}
      {/* 2. Rutas directas sin el '/index' para que coincidan con lo que busca Expo */}
      <Tabs.Screen name="descubrir" options={{ 
        title: "Descubrir",
        headerShown: false,
        tabBarIcon:({color, size, focused}) => (
          <Ionicons name={focused ? "compass" : 'compass-outline'} color={color} size={size} />
        ),
      }} />
      <Tabs.Screen name="comidas" options={{ 
        title: "Comidas",
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
          <Ionicons name={focused ? "information-circle" : 'information-circle-outline'} color={color} size={size} />
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
