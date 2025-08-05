import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

// Tab navigator type
export type TabParamList = {
  Home: undefined;
  Settings: undefined;
  About: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon = ({ focused, name }: { focused: boolean; name: string }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return '🏠';
      case 'Settings':
        return '⚙️';
      case 'About':
        return 'ℹ️';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {getIcon(name)}
    </Text>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={route.name} />
          ),
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
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
