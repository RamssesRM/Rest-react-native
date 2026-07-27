import { useTheme } from '@/hooks/use-theme';
import { useFilterStore } from '@/hooks/use-filterstore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const priceFilters = [
  { label: '$', value: 'bajo' },
  { label: '$$', value: 'medio' },
  { label: '$$$', value: 'alto' },
];

const sortOptions = [
  { label: 'Recomendados', value: 'recommended' },
  { label: 'Precio', value: 'price' },
  { label: 'Nombre A-Z', value: 'name' },
];

const cuisineFilters = [
  'Sushi',
  'Hamburguesas',
  'Almuerzos',
  'Marisquería',
  'Pizza',
  'Pasta',
  'Ensaladas',
  'Postres',
  'Bebidas',
];

const Page = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { categories, price, sort, setFilters, clearFilters } = useFilterStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(price);
  const [selectedSort, setSelectedSort] = useState(sort);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  const handleApply = () => {
    setFilters({
      categories: selectedCategories,
      price: selectedPrice,
      sort: selectedSort,
    });
    router.dismiss();
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <Text style={s.title}>Filtrar Menú</Text>

      <View style={s.filterSection}>
        <Text style={s.sectionTitle}>CATEGORÍA</Text>
        <View style={s.chipContainer}>
          {cuisineFilters.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[s.chip, selectedCategories.includes(cuisine) && s.chipSelected]}
              onPress={() => toggleCuisine(cuisine)}
            >
              <Text style={[s.chipText, selectedCategories.includes(cuisine) && s.chipTextSelected]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.filterSection}>
        <Text style={s.sectionTitle}>PRECIO</Text>
        <View style={s.chipContainer}>
          {priceFilters.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[s.chip, selectedPrice === p.value && s.chipSelected]}
              onPress={() => setSelectedPrice(p.value === selectedPrice ? null : p.value)}
            >
              <Text style={[s.chipText, selectedPrice === p.value && s.chipTextSelected]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.filterSection}>
        <Text style={s.sectionTitle}>ORDENAR POR</Text>
        <View style={s.chipContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[s.chip, selectedSort === option.value && s.chipSelected]}
              onPress={() => setSelectedSort(option.value)}
            >
              <Text style={[s.chipText, selectedSort === option.value && s.chipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.buttonRow}>
        <TouchableOpacity
          style={s.resetButton}
          onPress={() => {
            setSelectedCategories([]);
            setSelectedPrice(null);
            setSelectedSort('recommended');
            clearFilters();
            router.dismiss();
          }}
        >
          <Text style={s.resetButtonText}>Limpiar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.applyButton} onPress={handleApply}>
          <Text style={s.applyButtonText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: c.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 24,
    color: c.text,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textMuted,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: c.chipBg,
  },
  chipSelected: {
    backgroundColor: c.chipActiveBg,
  },
  chipText: {
    fontSize: 13,
    color: c.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: c.text,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: c.chipBg,
    borderWidth: 1,
    borderColor: c.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.textSecondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: c.gold,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
