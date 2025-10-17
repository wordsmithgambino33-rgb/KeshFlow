
// index.ts — Entry point for Expo + Tailwind (web + native)
import './styles/global.css'; // ✅ Tailwind styles (must be imported here)
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
