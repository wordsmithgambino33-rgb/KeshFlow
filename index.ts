
import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler'; // Ensure gestures work on web and mobile
import './styles/global.css'; // Import global CSS for web + Tailwind

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
