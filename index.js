/**
 * @format
 */

import 'react-native-gesture-handler'; // Must be at the top
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Enable screens native optimization
import { enableScreens } from 'react-native-screens';
enableScreens();

AppRegistry.registerComponent(appName, () => App);
