
  // App.tsx
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { LandingPage } from "./components/LandingPage";
import { WebDashboard } from "./pages/WebDashboard";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";

// Define stack
const Stack = createNativeStackNavigator();

// App content wrapped in theme logic
function AppContent() {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate initial load
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: mode === "dark" ? "#0a0a0a" : "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={mode === "dark" ? "#26a69a" : "#00796B"}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Dashboard" component={WebDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root component
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
