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
    },
});
export default ComidasHeader