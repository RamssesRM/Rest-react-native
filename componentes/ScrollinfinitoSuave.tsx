import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import React, {
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
} from "react-native-reanimated";

interface IconItem {
  color: string;
  isImage?: boolean;
  image?: ImageSourcePropType;
  emoji?: string;
}

const iconDataSets: Record<"set1" | "set2" | "set3", IconItem[]> = {
  set1: [
    { image: require("../assets/images/imageWebp/190.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/189.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/188.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/187.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/186.webp"), isImage: true, color: "transparent" },
  ],
  set2: [
    { image: require("../assets/images/imageWebp/181.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/182.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/183.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/184.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/185.webp"), isImage: true, color: "transparent" },
  ],
  set3: [
    { image: require("../assets/images/imageWebp/176.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/177.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/178.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/179.webp"), isImage: true, color: "transparent" },
    { image: require("../assets/images/imageWebp/180.webp"), isImage: true, color: "transparent" },
  ],
};

const ITEM_HEIGHT = 160;
const SCROLL_SPEED = 20; // pixels por segundo
const FRAME_RATE = 60; // frames por segundo

interface ScrollInfinitoSuaveProps {
  scrollDirection?: "up" | "down";
  iconSet?: "set1" | "set2" | "set3";
}

const ScrollInfinitoSuave = ({
  scrollDirection = "down",
  iconSet = "set1",
}: ScrollInfinitoSuaveProps) => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);

  const iconData = iconDataSets[iconSet];
  const items = [...iconData, ...iconData]; // Duplicamos para crear el efecto infinito
  const totalContentHeight = iconData.length * ITEM_HEIGHT;

  useEffect(() => {
    if (scrollDirection === "up") {
      scrollY.value = totalContentHeight;
    } else {
      scrollY.value = 0;
    }

    const interval = setInterval(() => {
      const increment =
        (SCROLL_SPEED / FRAME_RATE) * (scrollDirection === "up" ? -1 : 1);
      scrollY.value += increment;
    }, 1000 / FRAME_RATE);

    return () => clearInterval(interval);
  }, [scrollDirection]);

  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      if (scrollDirection === "down") {
        if (y >= totalContentHeight) {
          scrollY.value = 0;
          scrollTo(scrollRef, 0, 0, false);
        } else {
          scrollTo(scrollRef, 0, y, false);
        }
      } else {
        if (y <= 0) {
          scrollY.value = totalContentHeight;
          scrollTo(scrollRef, 0, totalContentHeight, false);
        } else {
          scrollTo(scrollRef, 0, y, false);
        }
      }
    },
  );

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.container}
      ref={scrollRef}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      {items.map((item, idx) => (
        <View
          key={idx}
          style={[styles.iconContainer, { backgroundColor: item.color }]}
        >
          {/* 2. Condicional inteligente: si tiene la propiedad 'isImage', renderiza la imagen. Si no, renderiza el emoji */}
          {item.isImage ? (
            <Image
              source={item.image}
              style={styles.imageStyle}
              contentFit='cover'
              placeholder={null}
              transition={200}
            />
          ) : (
            <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
          )}
        </View>
      ))}
    </Animated.ScrollView>
  );
};

// Definición de componente de scroll infinito suave

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 160,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 5,
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
  },
  imageStyle: {
    width: '100%',          // Ocupa todo el ancho del contenedor (160)
    height: '100%',         // Ocupa todo el alto del contenedor (ITEM_HEIGHT)
    borderRadius: 20,       // El mismo borde del contenedor para que encaje perfecto
  },
});
export default ScrollInfinitoSuave;
