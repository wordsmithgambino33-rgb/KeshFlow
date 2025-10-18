
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import './styles/global.css';

// ✅ Register the main app for Expo & React Native
registerRootComponent(App);

// ✅ Web-specific setup — ensures proper mounting on browsers
if (Platform.OS === 'web') {
  const rootTag =
    document.getElementById('root') || document.getElementById('main') || document.createElement('div');

  if (!rootTag.id) rootTag.id = 'root';
  if (!document.getElementById('root')) document.body.appendChild(rootTag);

  AppRegistry.registerComponent('main', () => App);
  AppRegistry.runApplication('main', { initialProps: {}, rootTag });
}
