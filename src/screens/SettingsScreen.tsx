import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';

const SettingsScreen = () => {
  const [metroAutoStart, setMetroAutoStart] = useState(true);
  const [bundleVerification, setBundleVerification] = useState(true);
  const [directoryValidation, setDirectoryValidation] = useState(true);
  const [hotReload, setHotReload] = useState(true);
  const [strictTypeChecks, setStrictTypeChecks] = useState(true);
  const [errorBoundaries, setErrorBoundaries] = useState(true);

  const handleMetroSettingToggle = (setting: string, value: boolean) => {
    Alert.alert(
      'Metro Setting Changed',
      `${setting} has been ${value ? 'enabled' : 'disabled'}.\n\nNote: This is a demonstration. In a real app, these settings would control actual Metro behavior.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleDevelopmentSettingToggle = (setting: string, value: boolean) => {
    Alert.alert(
      'Development Setting',
      `${setting} is now ${value ? 'enabled' : 'disabled'}.\n\nThis demonstrates how development preferences can be managed in the app.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showMetroInfo = () => {
    Alert.alert(
      'Metro Bundler Info',
      `Metro is React Native's JavaScript bundler.\n\nCurrent Configuration:\n• Auto-start: ${metroAutoStart ? 'Enabled' : 'Disabled'}\n• Bundle verification: ${bundleVerification ? 'Enabled' : 'Disabled'}\n• Directory validation: ${directoryValidation ? 'Enabled' : 'Disabled'}\n\nThese settings help prevent common Metro errors.`
    );
  };

  const showDevelopmentInfo = () => {
    Alert.alert(
      'Development Tools',
      `Development Features Status:\n\n• Hot Reload: ${hotReload ? 'Active' : 'Inactive'}\n• TypeScript Strict: ${strictTypeChecks ? 'Active' : 'Inactive'}\n• Error Boundaries: ${errorBoundaries ? 'Active' : 'Inactive'}\n\nPlatform: ${Platform.OS}\nVersion: ${Platform.Version}`
    );
  };

  const resetAllSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setMetroAutoStart(true);
            setBundleVerification(true);
            setDirectoryValidation(true);
            setHotReload(true);
            setStrictTypeChecks(true);
            setErrorBoundaries(true);
            Alert.alert('Settings Reset', 'All settings have been reset to defaults.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your app preferences</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🛡️ Metro Prevention</Text>
          <TouchableOpacity onPress={showMetroInfo}>
            <Text style={styles.infoButton}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Metro Auto-Start</Text>
            <Text style={styles.settingDesc}>
              Automatically start Metro from correct directory
            </Text>
          </View>
          <Switch
            value={metroAutoStart}
            onValueChange={(value) => {
              setMetroAutoStart(value);
              handleMetroSettingToggle('Metro Auto-Start', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={metroAutoStart ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Bundle Verification</Text>
            <Text style={styles.settingDesc}>
              Test bundle endpoint before app launch
            </Text>
          </View>
          <Switch
            value={bundleVerification}
            onValueChange={(value) => {
              setBundleVerification(value);
              handleMetroSettingToggle('Bundle Verification', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={bundleVerification ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Directory Validation</Text>
            <Text style={styles.settingDesc}>
              Verify project directory before Metro start
            </Text>
          </View>
          <Switch
            value={directoryValidation}
            onValueChange={(value) => {
              setDirectoryValidation(value);
              handleMetroSettingToggle('Directory Validation', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={directoryValidation ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚙️ Development</Text>
          <TouchableOpacity onPress={showDevelopmentInfo}>
            <Text style={styles.infoButton}>ℹ️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Hot Reload</Text>
            <Text style={styles.settingDesc}>
              Automatically reload app on code changes
            </Text>
          </View>
          <Switch
            value={hotReload}
            onValueChange={(value) => {
              setHotReload(value);
              handleDevelopmentSettingToggle('Hot Reload', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={hotReload ? '#34C759' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>TypeScript Checks</Text>
            <Text style={styles.settingDesc}>
              Enable strict type checking
            </Text>
          </View>
          <Switch
            value={strictTypeChecks}
            onValueChange={(value) => {
              setStrictTypeChecks(value);
              handleDevelopmentSettingToggle('TypeScript Checks', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={strictTypeChecks ? '#34C759' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Error Boundaries</Text>
            <Text style={styles.settingDesc}>
              Catch and display runtime errors gracefully
            </Text>
          </View>
          <Switch
            value={errorBoundaries}
            onValueChange={(value) => {
              setErrorBoundaries(value);
              handleDevelopmentSettingToggle('Error Boundaries', value);
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={errorBoundaries ? '#34C759' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Debug Info', 'Metro bundler is running normally.\n\nBundle status: Active\nLast refresh: ' + new Date().toLocaleTimeString())}>
          <Text style={styles.actionButtonText}>View Metro Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetAllSettings}>
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  infoButton: {
    fontSize: 20,
    color: '#007AFF',
    padding: 5,
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
  resetButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
