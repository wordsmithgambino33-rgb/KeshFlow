
// index.ts
import 'react-native-gesture-handler'; // ensures gestures work for navigation
import { registerRootComponent } from 'expo';
import App from './App';

// Register App for Expo and web
registerRootComponent(App);
