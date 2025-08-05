import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const HomeScreen = () => {
  const handleFeaturePress = (feature: string) => {
    Alert.alert('Feature Demo', `You tapped: ${feature}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ReactNativeTest</Text>
        <Text style={styles.subtitle}>Metro Error Prevention Demo</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Project Features</Text>
        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('React Navigation')}>
            <Text style={styles.featureIcon}>🧭</Text>
            <Text style={styles.featureTitle}>Navigation</Text>
            <Text style={styles.featureDesc}>Multi-screen navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('Metro Safety')}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Metro Safety</Text>
            <Text style={styles.featureDesc}>Error prevention system</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('TypeScript')}>
            <Text style={styles.featureIcon}>📘</Text>
            <Text style={styles.featureTitle}>TypeScript</Text>
            <Text style={styles.featureDesc}>Type-safe development</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress('iOS Build')}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureTitle}>iOS Ready</Text>
            <Text style={styles.featureDesc}>Configured for iOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleFeaturePress('Test Metro Bundle')}>
          <Text style={styles.actionButtonText}>Test Metro Bundle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleFeaturePress('View Documentation')}>
          <Text style={styles.actionButtonText}>View Documentation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Created: August 4, 2025{'\n'}
          React Native 0.80.2 with Metro Prevention
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
