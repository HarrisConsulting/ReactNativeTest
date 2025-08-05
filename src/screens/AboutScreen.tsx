import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';

const AboutScreen = () => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const handleDocumentationPress = (doc: string) => {
    Alert.alert('Documentation', `Opening: ${doc}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.subtitle}>ReactNativeTest Project Information</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Project Details</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Project Name</Text>
          <Text style={styles.infoValue}>ReactNativeTest</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>React Native Version</Text>
          <Text style={styles.infoValue}>0.80.2</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>August 4, 2025</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bundle ID</Text>
          <Text style={styles.infoValue}>org.montessoricenter.reactnativetest</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Metro Version</Text>
          <Text style={styles.infoValue}>0.82.5</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ Metro Error Prevention</Text>
        <Text style={styles.description}>
          This project was created with comprehensive Metro bundler error prevention 
          protocols based on debugging experience. It includes automated safety scripts, 
          directory verification, and bundle testing to prevent common React Native 
          development issues.
        </Text>

        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✅ Metro Safety Script</Text>
          <Text style={styles.featureItem}>✅ Bundle Endpoint Testing</Text>
          <Text style={styles.featureItem}>✅ Directory Verification</Text>
          <Text style={styles.featureItem}>✅ Automated Error Prevention</Text>
          <Text style={styles.featureItem}>✅ Comprehensive Documentation</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Documentation</Text>
        
        <TouchableOpacity
          style={styles.docButton}
          onPress={() => handleDocumentationPress('Quick Reference')}>
          <Text style={styles.docButtonText}>Metro Prevention Quick Reference</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.docButton}
          onPress={() => handleDocumentationPress('Project Creation Checklist')}>
          <Text style={styles.docButtonText}>Project Creation Checklist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.docButton}
          onPress={() => handleDocumentationPress('Anti-Error Protocol')}>
          <Text style={styles.docButtonText}>Anti-Error Protocol Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.docButton}
          onPress={() => handleDocumentationPress('Auto Project Generator')}>
          <Text style={styles.docButtonText}>Auto Project Generator</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Resources</Text>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress('https://reactnative.dev')}>
          <Text style={styles.linkButtonText}>React Native Documentation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress('https://reactnavigation.org')}>
          <Text style={styles.linkButtonText}>React Navigation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => handleLinkPress('https://facebook.github.io/metro/')}>
          <Text style={styles.linkButtonText}>Metro Bundler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with React Native and comprehensive error prevention{'\n'}
          Metro directory issues solved through systematic debugging
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
    backgroundColor: '#FF3B30',
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
    color: '#FFE4E1',
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
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  featureList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  docButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  docButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#5856D6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  linkButtonText: {
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

export default AboutScreen;
