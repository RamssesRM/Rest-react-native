import { View, Text, StyleSheet } from 'react-native'
import Animated, { SharedValue } from 'react-native-reanimated';

interface ComidasHeaderProps {
    title: string;
    scrollOffset: SharedValue<number>;
}

const ComidasHeader = ({ title, scrollOffset }: ComidasHeaderProps) => {
  return (
    <Animated.View style={styles.headerContainer}>
      <Text>ComidasHeader</Text>
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
});
export default ComidasHeader