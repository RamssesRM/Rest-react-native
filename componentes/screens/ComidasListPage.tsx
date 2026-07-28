import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoriasList } from "../CategoriasList";
import ComidasHeader from "../ComidasHeader";
import ComidasList from "../ComidasList";

const ComidasListPage = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ComidasHeader title="Menú" />
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.pageTitle}>Comidas</Text>
        <CategoriasList />
        <ComidasList />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});

export default ComidasListPage;
