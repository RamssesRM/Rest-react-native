import { Fonts } from "@/constants/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoriasList } from "../CategoriasList";
import ComidasHeader from "../ComidasHeader";
import ComidasList from "../ComidasList";

const ComidasListPage = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ComidasHeader title="Menus" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      >
        <Text style={styles.pageTitle}>Menus</Text>
        <CategoriasList />

        <Text style={styles.allComidasTitle}>Todos los menus</Text>
        <ComidasList />
      </ScrollView>
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
