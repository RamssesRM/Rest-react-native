import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MAPS_URL = "https://maps.app.goo.gl/EXHqWDRfpgcMc8pc7";

const Page = () => {
  const { colors } = useTheme();

  const openMaps = async () => {
    const canOpen = await Linking.canOpenURL(MAPS_URL);
    if (canOpen) {
      await Linking.openURL(MAPS_URL);
    } else {
      Alert.alert("Error", "No se puede abrir Google Maps.");
    }
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <Text style={s.title}>Ubicación</Text>

      <TouchableOpacity style={s.locationItem} onPress={openMaps} activeOpacity={0.7}>
        <View style={[s.locationItemIcon, { backgroundColor: colors.successLight }]}>
          <Ionicons name="location-outline" size={18} color={colors.success} />
        </View>
        <View style={s.addressInfo}>
          <Text style={s.addressText}>Helus Restobar</Text>
          <Text style={s.cityText}>San Cristóbal, Venezuela</Text>
        </View>
        <Ionicons name="open-outline" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={s.locationItem} onPress={openMaps} activeOpacity={0.7}>
        <View style={s.locationItemIcon}>
          <Ionicons name="map-outline" size={18} color={colors.text} />
        </View>
        <View style={s.addressInfo}>
          <Text style={s.addressText}>Ver en Google Maps</Text>
          <Text style={s.cityText}>Abrir mapa para ver ruta</Text>
        </View>
        <Ionicons name="open-outline" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={s.locationItem}>
        <View style={s.locationItemIcon}>
          <Ionicons name="locate-outline" size={18} color={colors.text} />
        </View>
        <View style={s.addressInfo}>
          <Text style={s.addressText}>Mi ubicación actual</Text>
          <Text style={s.cityText}>Usar GPS del dispositivo</Text>
        </View>
      </TouchableOpacity>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Horarios</Text>
      </View>

      <View style={s.hoursItem}>
        <Text style={s.hoursDay}>Lunes - Jueves</Text>
        <Text style={s.hoursTime}>11:00 - 22:00</Text>
      </View>
      <View style={s.hoursItem}>
        <Text style={s.hoursDay}>Viernes - Sábado</Text>
        <Text style={s.hoursTime}>11:00 - 23:00</Text>
      </View>
      <View style={[s.hoursItem, { borderBottomWidth: 0 }]}>
        <Text style={s.hoursDay}>Domingo</Text>
        <Text style={s.hoursTime}>12:00 - 22:00</Text>
      </View>
    </View>
  );
};

export default Page;

const styles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    color: c.text,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 14,
  },
  locationItemIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: c.gray100,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: c.text,
    marginBottom: 2,
  },
  cityText: {
    fontSize: 13,
    color: c.textMuted,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  hoursDay: {
    fontSize: 15,
    color: c.textSecondary,
  },
  hoursTime: {
    fontSize: 15,
    fontWeight: '600',
    color: c.secondary,
  },
});
