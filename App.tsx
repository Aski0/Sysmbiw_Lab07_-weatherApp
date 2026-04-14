import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WeatherScreen from './components/WeatherScreen';

function AppContent() {
  const insets = useSafeAreaInsets();
  // insets.top is a runtime value from the hook, so it cannot live in StyleSheet.create()
  return (
    <View style={[StyleSheet.absoluteFill, styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.titleText}>SysMiW, React Native, lab.7</Text>
      <WeatherScreen />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffff00',
  },
});
