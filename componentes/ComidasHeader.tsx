import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native'
import Animated, { SharedValue } from 'react-native-reanimated';
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ComidasHeaderProps {
    title: string;
    scrollOffset: SharedValue<number>;
}

const ComidasHeader = ({ title, scrollOffset }: ComidasHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header1]}>

    <TouchableOpacity style={styles.locationButton}>
      <View style={styles.locationButtonIcon}>
        <Ionicons name='business-outline'size={16} />
      </View>
      <Text style={styles.locationText}>Ubicación</Text>
      <Ionicons name='chevron-down'size={16} />
    </TouchableOpacity>
    <View style={styles.rightIcons}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name='filter' size={20} />
      </TouchableOpacity>
    </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffd700',
        zIndex: 100,
        boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.2)',
    },
    header1: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      gap: 6,
    },
    locationButtonIcon: {
      borderRadius: 20,
      backgroundColor: Colors.light,
      padding: 10,
    }
});
export default ComidasHeader