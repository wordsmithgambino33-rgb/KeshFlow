
// index.ts
import 'react-native-gesture-handler'; // ensures gestures work for navigation
import { registerRootComponent } from 'expo';
import App from './App';

// Import global CSS for web
import './global.css';

// Register App for Expo and web
registerRootComponent(App);
