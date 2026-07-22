import { Fonts } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoriasList } from "../CategoriasList";
import ComidasHeader from "../ComidasHeader";
import ComidasList from "../ComidasList";
const HEADER_HEIGHT = 60;
const ComidasListPage = () => {
  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y
    }
  })

  return (
    <View style={styles.container}>

      <ComidasHeader title='Menus'scrollOffset={scrollOffset} />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + HEADER_HEIGHT }}>
        <Text style={styles.pageTitle}>Menus</Text>
        <CategoriasList />

        <Text style={styles.allComidasTitle}>Todos los menus</Text>
        <ComidasList />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: Fonts.brandBlack,
    fontSize: 25,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  allComidasTitle: {
    fontFamily: Fonts.brandBold,
    fontSize: 30,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});

export default ComidasListPage;
