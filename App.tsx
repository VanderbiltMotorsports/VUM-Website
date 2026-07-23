import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Linking } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>RN Web Starter</Text>
        <Text style={styles.subtitle}>
          Single codebase with Expo + react-native-web
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL('https://reactnative.dev')}
        >
          <Text style={styles.buttonText}>Open React Native docs</Text>
        </Pressable>

        <Text style={styles.footer}>Edit App.tsx to get started.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  },
  footer: {
    color: '#666',
    fontSize: 12
  }
});
