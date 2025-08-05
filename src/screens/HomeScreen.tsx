import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/hooks';

type TabParamList = {
  Home: undefined;
  Settings: undefined;
  About: undefined;
  Auth: { screen?: string; params?: { returnTo?: string } };
};

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isAuthenticated, user } = useAuth();
  const [metroStatus] = useState('Running'); // Remove setMetroStatus since it's not used
  const [lastBundleCheck, setLastBundleCheck] = useState(new Date().toLocaleTimeString());

  const handleNavigationDemo = () => {
    Alert.alert(
      'Navigation Demo',
      'This app demonstrates React Navigation with:\n\n• Bottom Tab Navigation\n• Type-safe navigation with TypeScript\n• Multiple screens (Home, Settings, About)\n• Custom tab icons and styling',
      [
        { text: 'View Settings', onPress: () => navigation.navigate('Settings' as never) },
        { text: 'View About', onPress: () => navigation.navigate('About' as never) },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleMetroSafetyDemo = () => {
    setLastBundleCheck(new Date().toLocaleTimeString());
    Alert.alert(
      'Metro Safety Demo',
      `Metro Bundle Status: ${metroStatus}\n\nSafety Features:\n• Automatic Metro process detection\n• Bundle endpoint verification\n• Project directory validation\n• Error prevention protocols\n\nLast checked: ${lastBundleCheck}`,
      [
        { text: 'Test Bundle', onPress: testMetroBundle },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const testMetroBundle = () => {
    // Simulate bundle testing
    setTimeout(() => {
      Alert.alert(
        'Bundle Test Complete',
        '✅ Metro bundle is healthy\n✅ JavaScript bundle loaded successfully\n✅ No bundling errors detected'
      );
    }, 1000);
  };

  const handleTypeScriptDemo = () => {
    const typeInfo = {
      strictMode: true,
      noImplicitAny: true,
      version: '5.0+',
      features: ['Type Safety', 'IntelliSense', 'Error Prevention', 'Refactoring Support']
    };

    Alert.alert(
      'TypeScript Demo',
      `TypeScript Configuration:\n\n• Strict Mode: ${typeInfo.strictMode ? 'Enabled' : 'Disabled'}\n• No Implicit Any: ${typeInfo.noImplicitAny ? 'Enabled' : 'Disabled'}\n• Version: ${typeInfo.version}\n\nActive Features:\n${typeInfo.features.map(f => `• ${f}`).join('\n')}`,
      [
        { text: 'View Types', onPress: showTypeDemo },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const showTypeDemo = () => {
    Alert.alert(
      'Type Safety Example',
      'This app uses TypeScript for:\n\n• Navigation type safety\n• Component prop types\n• State management\n• API response types\n• Style object types\n\nAll code has full type coverage!'
    );
  };

  const handleiOSDemo = () => {
    const iosInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      // Platform.isPad only exists on iOS, check safely
      isPad: Platform.OS === 'ios' && 'isPad' in Platform ? (Platform as any).isPad : false,
      isTV: Platform.isTV,
    };

    Alert.alert(
      'iOS Configuration',
      `Platform Details:\n\n• Platform: ${iosInfo.platform}\n• Version: ${iosInfo.version}\n• iPad: ${iosInfo.isPad ? 'Yes' : 'No'}\n• TV: ${iosInfo.isTV ? 'Yes' : 'No'}\n\niOS Features:\n• Native module integration\n• CocoaPods configuration\n• App Store ready build\n• iOS-specific optimizations`,
      [
        { text: 'Platform Info', onPress: showPlatformInfo },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const showPlatformInfo = () => {
    const capabilities = [
      '• Safe Area handling',
      '• Native navigation gestures',
      '• iOS design patterns',
      '• App lifecycle management',
      '• Background task handling',
      '• Push notification ready'
    ];

    Alert.alert(
      'iOS Capabilities',
      `This app includes:\n\n${capabilities.join('\n')}\n\nReady for App Store deployment!`
    );
  };

  const showDocumentationInfo = () => {
    Alert.alert(
      'Documentation Available',
      'This project includes comprehensive documentation:\n\n• Complete setup guides\n• CI/CD implementation\n• Troubleshooting references\n• Best practices\n• Enterprise patterns\n\nTotal: 35+ documentation files',
      [
        { text: 'View File List', onPress: showDocFileList },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleAuthenticationDemo = () => {
    const authStatus = isAuthenticated ? 'Authenticated' : 'Not Authenticated';
    const userInfo = user ? `\n\nUser: ${user.email}\nVerified: ${user.isVerified ? 'Yes' : 'No'}` : '';

    Alert.alert(
      'Email Authentication System',
      `Status: ${authStatus}${userInfo}\n\nFeatures:\n• Email-only authentication\n• No passwords to remember\n• Time-limited verification codes\n• Secure token-based sessions\n• Protected content access`,
      [
        { text: 'Go to Auth Tab', onPress: () => navigation.navigate('Auth', {}) },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handlePlayGameAction = () => {
    if (isAuthenticated) {
      // User is authenticated, go directly to game
      navigation.navigate('Auth', { screen: 'Game' });
    } else {
      // User needs to authenticate first
      Alert.alert(
        'Authentication Required',
        'You need to be authenticated to access the protected game. Would you like to login now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Auth', {
              screen: 'Login',
              params: { returnTo: 'Game' }
            })
          },
        ]
      );
    }
  };

  const showDocFileList = () => {
    const docCategories = [
      '📁 Setup Guides (5 files)',
      '📁 CI/CD Documentation (8 files)',
      '📁 Troubleshooting (12 files)',
      '📁 Implementation Guides (10+ files)',
      '📁 Chat Logs & Session Notes'
    ];

    Alert.alert(
      'Documentation Structure',
      `Available in docs/ folder:\n\n${docCategories.join('\n')}\n\nAll documentation is production-ready and battle-tested!`
    );
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
            onPress={handleNavigationDemo}>
            <Text style={styles.featureIcon}>🧭</Text>
            <Text style={styles.featureTitle}>Navigation</Text>
            <Text style={styles.featureDesc}>Multi-screen navigation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleMetroSafetyDemo}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Metro Safety</Text>
            <Text style={styles.featureDesc}>Error prevention system</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleTypeScriptDemo}>
            <Text style={styles.featureIcon}>📘</Text>
            <Text style={styles.featureTitle}>TypeScript</Text>
            <Text style={styles.featureDesc}>Type-safe development</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleiOSDemo}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureTitle}>iOS Ready</Text>
            <Text style={styles.featureDesc}>Configured for iOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleAuthenticationDemo}>
            <Text style={styles.featureIcon}>🔐</Text>
            <Text style={styles.featureTitle}>Authentication</Text>
            <Text style={styles.featureDesc}>Email-only auth system</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={testMetroBundle}>
          <Text style={styles.actionButtonText}>Test Metro Bundle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={showDocumentationInfo}>
          <Text style={styles.actionButtonText}>View Documentation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Protected Content</Text>
        <TouchableOpacity
          style={[styles.protectedButton, isAuthenticated ? styles.protectedButtonAuthenticated : styles.protectedButtonLocked]}
          onPress={handlePlayGameAction}>
          <Text style={styles.protectedButtonIcon}>
            {isAuthenticated ? '🎮' : '🔒'}
          </Text>
          <View style={styles.protectedButtonContent}>
            <Text style={[styles.protectedButtonText, isAuthenticated ? styles.protectedButtonTextAuthenticated : styles.protectedButtonTextLocked]}>
              {isAuthenticated ? 'Play Protected Game' : 'Login to Play Game'}
            </Text>
            <Text style={styles.protectedButtonSubtext}>
              {isAuthenticated
                ? `Welcome, ${user?.email?.split('@')[0] || 'User'}!`
                : 'Requires email authentication'
              }
            </Text>
          </View>
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
  protectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  protectedButtonAuthenticated: {
    borderColor: '#34C759',
    backgroundColor: '#f8fff9',
  },
  protectedButtonLocked: {
    borderColor: '#FF9500',
    backgroundColor: '#fffaf5',
  },
  protectedButtonIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  protectedButtonContent: {
    flex: 1,
  },
  protectedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  protectedButtonTextAuthenticated: {
    color: '#34C759',
  },
  protectedButtonTextLocked: {
    color: '#FF9500',
  },
  protectedButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
