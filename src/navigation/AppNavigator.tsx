import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet } from 'react-native';
import { useAuth } from '../auth/hooks';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';
import GameScreen from '../screens/auth/GameScreen';

// Navigation types
export type TabParamList = {
  Home: undefined;
  Settings: undefined;
  About: undefined;
  Auth: { screen?: string; params?: { returnTo?: string } };
};

export type AuthStackParamList = {
  Login: { returnTo?: string };
  Verification: { email: string; returnTo?: string };
  Profile: undefined;
  Game: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

// Define styles outside component to avoid inline styles
const styles = StyleSheet.create({
  tabIconFocused: {
    fontSize: 20,
    opacity: 1,
  },
  tabIconUnfocused: {
    fontSize: 20,
    opacity: 0.5,
  },
});

const TabIcon = ({ focused, name }: { focused: boolean; name: string }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return '🏠';
      case 'Settings':
        return '⚙️';
      case 'About':
        return 'ℹ️';
      case 'Auth':
        return '🔐';
      default:
        return '📱';
    }
  };

  return (
    <Text style={focused ? styles.tabIconFocused : styles.tabIconUnfocused}>
      {getIcon(name)}
    </Text>
  );
};

// Define the tab bar icon renderer outside the component
const renderTabIcon = ({ focused, route }: { focused: boolean; route: any }) => (
  <TabIcon focused={focused} name={route.name} />
);

// Auth Stack Navigator Component
const AuthStackNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#34C759',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated user screens
        <>
          <AuthStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'My Profile' }}
          />
          <AuthStack.Screen
            name="Game"
            component={GameScreen}
            options={{ title: 'Protected Game' }}
          />
        </>
      ) : (
        // Unauthenticated user screens
        <>
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Email Authentication' }}
          />
          <AuthStack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{ title: 'Verify Email' }}
          />
        </>
      )}
    </AuthStack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => renderTabIcon({ focused, route }),
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            paddingTop: 5,
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'ReactNativeTest',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerStyle: {
              backgroundColor: '#34C759',
            },
          }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'About',
            headerStyle: {
              backgroundColor: '#FF3B30',
            },
          }}
        />
        <Tab.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{
            title: 'Authentication',
            headerShown: false, // Hide tab header, let stack handle it
            headerStyle: {
              backgroundColor: '#34C759',
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
