
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './components/ThemeProvider';
import { LandingPage } from './components/LandingPage';
import { WebDashboard } from './components/WebDashboard';
import { TransactionLogging } from './components/TransactionLogging';
import { EnhancedBudgetManagement } from './components/EnhancedBudgetManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { GoalsSaving } from './components/GoalsSaving';
import { PortfolioPage } from './components/PortfolioPage';
import { BillsSubscriptions } from './components/BillsSubscriptions';
import { EducationCenter } from './components/EducationCenter';
import { Marketplace } from './components/Marketplace';
import { Community } from './components/Community';
import { TaxManagement } from './components/TaxManagement';
import { InsuranceHub } from './components/InsuranceHub';
import { FinancialHealthScore } from './components/FinancialHealthScore';
import { ProfileSettings } from './components/ProfileSettings';
import { SupportCenter } from './components/SupportCenter';
import { SignUpAuth } from './components/SignUpAuth';
import { WebSidebar } from './components/WebSidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { Menu, X } from 'lucide-react';

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
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleGetStarted = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleSignUp = () => setCurrentScreen('signup');
  const handleSignUpComplete = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} onSignUp={handleSignUp} />;
      case 'signup':
        return <SignUpAuth onBack={() => setCurrentScreen('landing')} onSignUpComplete={handleSignUpComplete} />;
      case 'dashboard':
        return <WebDashboard onNavigate={setCurrentScreen} />;
      case 'transactions':
        return <TransactionLogging onBack={() => setCurrentScreen('dashboard')} />;
      case 'budget':
        return <EnhancedBudgetManagement onBack={() => setCurrentScreen('dashboard')} />;
      case 'reports':
        return <ReportsAnalytics onBack={() => setCurrentScreen('dashboard')} />;
      case 'goals':
        return <GoalsSaving onBack={() => setCurrentScreen('dashboard')} />;
      case 'portfolio':
        return <PortfolioPage onNavigate={setCurrentScreen} />;
      case 'bills':
        return <BillsSubscriptions onNavigate={setCurrentScreen} />;
      case 'education':
        return <EducationCenter onNavigate={setCurrentScreen} />;
      case 'marketplace':
        return <Marketplace onNavigate={setCurrentScreen} />;
      case 'community':
        return <Community onNavigate={setCurrentScreen} />;
      case 'taxes':
        return <TaxManagement onNavigate={setCurrentScreen} />;
      case 'insurance':
        return <InsuranceHub onNavigate={setCurrentScreen} />;
      case 'financial-health':
        return <FinancialHealthScore onNavigate={setCurrentScreen} />;
      case 'profile':
        return <ProfileSettings onNavigate={setCurrentScreen} />;
      case 'support':
        return <SupportCenter onNavigate={setCurrentScreen} />;
      default:
        return <WebDashboard onNavigate={setCurrentScreen} />;
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-landing-neon">{renderScreen()}</div>;
  }

  return (
    <div className="min-h-screen bg-landing-neon flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg"
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Web Sidebar - Desktop */}
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
      <div className="flex-1 lg:ml-64 min-h-screen p-4">
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
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
