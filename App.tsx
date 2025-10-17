
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { LandingPage } from './components/LandingPage';
import { WebDashboard } from './pages/WebDashboard';
import { TransactionLogging } from './pages/TransactionLogging';
import { EnhancedBudgetManagement } from './pages/EnhancedBudgetManagement';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { GoalsSaving } from './pages/GoalsSaving';
import { PortfolioPage } from './pages/PortfolioPage';
import { BillsSubscriptions } from './pages/BillsSubscriptions';
import { EducationCenter } from './pages/EducationCenter';
import { Marketplace } from './pages/MarketPlace';
import { Community } from './pages/Community';
import { TaxManagement } from './pages/TaxManagement';
import { InsuranceHub } from './pages/InsuranceHub';
import { FinancialHealthScore } from './pages/FinancialHealthScore';
import { ProfileSettings } from './pages/ProfileSettings';
import { SupportCenter } from './pages/SupportCenter';
import { SignUpAuth } from './components/SignUpAuth';
import { WebSidebar } from './components/WebSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { ThemeToggle } from './ui/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { auth } from './firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({ default: 'native' });

export type Screen =
  | 'landing'
  | 'signup'
  | 'dashboard'
  | 'transactions'
  | 'budget'
  | 'reports'
  | 'goals'
  | 'portfolio'
  | 'bills'
  | 'education'
  | 'marketplace'
  | 'community'
  | 'taxes'
  | 'insurance'
  | 'financial-health'
  | 'profile'
  | 'settings'
  | 'support';

function AppContent() {
  const { mode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Update tab title
  useEffect(() => {
    document.title = 'KeshFlow';
  }, []);

  useEffect(() => {
    const screenTitles: Record<Screen, string> = {
      landing: 'KeshFlow | Home',
      signup: 'KeshFlow | Sign Up',
      dashboard: 'KeshFlow | Dashboard',
      transactions: 'KeshFlow | Transactions',
      budget: 'KeshFlow | Budget',
      reports: 'KeshFlow | Reports',
      goals: 'KeshFlow | Goals & Saving',
      portfolio: 'KeshFlow | Portfolio',
      bills: 'KeshFlow | Bills & Subscriptions',
      education: 'KeshFlow | Education Center',
      marketplace: 'KeshFlow | Marketplace',
      community: 'KeshFlow | Community',
      taxes: 'KeshFlow | Tax Management',
      insurance: 'KeshFlow | Insurance Hub',
      'financial-health': 'KeshFlow | Financial Health',
      profile: 'KeshFlow | Profile',
      settings: 'KeshFlow | Settings',
      support: 'KeshFlow | Support',
    };

    if (user && currentScreen === 'dashboard') {
      document.title = `KeshFlow | Dashboard (${user.displayName || 'User'})`;
    } else {
      document.title = screenTitles[currentScreen] || 'KeshFlow';
    }
  }, [currentScreen, user]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      // Only set dashboard if explicitly navigating
      // Initial landing page stays
    });
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => setCurrentScreen('signup');
  const handleSignUpComplete = (user: User) => {
    setUser(user);
    setCurrentScreen('dashboard');
  };
  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setCurrentScreen('landing');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'signup':
        return <SignUpAuth onBack={() => setCurrentScreen('landing')} onSignUpComplete={handleSignUpComplete} />;
      case 'dashboard':
        return <WebDashboard onNavigate={setCurrentScreen} user={user} />;
      case 'transactions':
        return <TransactionLogging onBack={() => setCurrentScreen('dashboard')} user={user} />;
      case 'budget':
        return <EnhancedBudgetManagement onBack={() => setCurrentScreen('dashboard')} user={user} />;
      case 'reports':
        return <ReportsAnalytics onBack={() => setCurrentScreen('dashboard')} user={user} />;
      case 'goals':
        return <GoalsSaving onBack={() => setCurrentScreen('dashboard')} user={user} />;
      case 'portfolio':
        return <PortfolioPage onNavigate={setCurrentScreen} user={user} />;
      case 'bills':
        return <BillsSubscriptions onNavigate={setCurrentScreen} user={user} />;
      case 'education':
        return <EducationCenter onNavigate={setCurrentScreen} user={user} />;
      case 'marketplace':
        return <Marketplace onNavigate={setCurrentScreen} user={user} />;
      case 'community':
        return <Community onNavigate={setCurrentScreen} user={user} />;
      case 'taxes':
        return <TaxManagement onNavigate={setCurrentScreen} user={user} />;
      case 'insurance':
        return <InsuranceHub onNavigate={setCurrentScreen} user={user} />;
      case 'financial-health':
        return <FinancialHealthScore onNavigate={setCurrentScreen} user={user} />;
      case 'profile':
        return <ProfileSettings onNavigate={setCurrentScreen} user={user} />;
      case 'settings':
        return <ProfileSettings onNavigate={setCurrentScreen} user={user} />;
      case 'support':
        return <SupportCenter onNavigate={setCurrentScreen} user={user} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  if (loadingAuth)
    return (
      <View className={`flex-1 justify-center items-center ${mode === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <Text className={`text-lg ${mode === 'dark' ? 'text-white' : 'text-black'}`}>Loading...</Text>
      </View>
    );

  return (
    <View className={`flex-1 flex-row ${mode === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Mobile Menu Button */}
      <Pressable
        onPress={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg"
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Pressable>

      {/* Theme Toggle */}
      <View className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </View>

      {/* Web Sidebar */}
      <WebSidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOpen={true}
        onClose={() => {}}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOpen={isMobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <View className="flex-1 lg:ml-64 min-h-screen p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
