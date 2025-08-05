import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const SettingsScreen = () => {
  const handleSettingPress = (setting: string) => {
    Alert.alert('Settings', `Configure: ${setting}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your app preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ Metro Prevention</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Metro Auto-Start')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Metro Auto-Start</Text>
            <Text style={styles.settingDesc}>
              Automatically start Metro from correct directory
            </Text>
          </View>
          <Text style={styles.settingValue}>ON</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Bundle Verification')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Bundle Verification</Text>
            <Text style={styles.settingDesc}>
              Test bundle endpoint before app launch
            </Text>
          </View>
          <Text style={styles.settingValue}>ENABLED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Directory Validation')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Directory Validation</Text>
            <Text style={styles.settingDesc}>
              Verify project directory before Metro start
            </Text>
          </View>
          <Text style={styles.settingValue}>ACTIVE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Development</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Hot Reload')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Hot Reload</Text>
            <Text style={styles.settingDesc}>
              Automatically reload app on code changes
            </Text>
          </View>
          <Text style={styles.settingValue}>ON</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('TypeScript Checks')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>TypeScript Checks</Text>
            <Text style={styles.settingDesc}>
              Enable strict type checking
            </Text>
          </View>
          <Text style={styles.settingValue}>STRICT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Error Boundaries')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Error Boundaries</Text>
            <Text style={styles.settingDesc}>
              Catch and display runtime errors gracefully
            </Text>
          </View>
          <Text style={styles.settingValue}>ON</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Debugging</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Debug', 'Opening Metro bundler logs...')}>
          <Text style={styles.actionButtonText}>View Metro Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Debug', 'Clearing Metro cache...')}>
          <Text style={styles.actionButtonText}>Clear Metro Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Debug', 'Testing bundle endpoint...')}>
          <Text style={styles.actionButtonText}>Test Bundle Endpoint</Text>
        </TouchableOpacity>
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
    backgroundColor: '#34C759',
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
    color: '#E8F5E8',
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
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  actionButton: {
    backgroundColor: '#FF9500',
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
});

export default SettingsScreen;
