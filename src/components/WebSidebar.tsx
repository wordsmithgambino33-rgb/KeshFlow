
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, CreditCard, PieChart, Target, BarChart3, Wallet, LogOut, User, Bell, HelpCircle, TrendingUp, Receipt, GraduationCap, ShoppingBag, Users, FileText, Shield, Activity, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { db, auth } from '../firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { type Screen } from '../App';

interface WebSidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export function WebSidebar({ currentScreen, onNavigate, isOpen, onClose, onLogout }: WebSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Main', 'Wealth Building', 'Management', 'Learn & Grow']);
  const [pendingBillsCount, setPendingBillsCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [userName, setUserName] = useState<string>('Guest');
  const [membership, setMembership] = useState<string>('Basic Member');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName('Guest');
        setMembership('Basic Member');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        const data = userSnap.exists() ? userSnap.data() : null;
        setUserName(data?.displayName || data?.name || user.displayName || 'User');

        const rawPlan =
          (data && (data.subscription?.plan || data.plan || data.subscriptionLevel || data.membership)) ||
          'basic';
        const plan = String(rawPlan).toLowerCase();
        if (plan === 'premium') setMembership('Premium Member');
        else if (plan === 'standard' || plan === 'standard_member' || plan === 'standard member') setMembership('Standard Member');
        else setMembership('Basic Member');
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setUserName(user.displayName || 'User');
        setMembership('Basic Member');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const fetchPendingBills = async () => {
    try {
      const q = query(collection(db, 'bills'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      setPendingBillsCount(snapshot.size);
    } catch (err) {
      console.error('Error fetching pending bills:', err);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), where('read', '==', false));
      const snapshot = await getDocs(q);
      setUnreadNotifications(snapshot.size);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchPendingBills();
    fetchUnreadNotifications();
  }, []);

  const navigationSections: NavigationSection[] = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard' as Screen, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'transactions' as Screen, label: 'Transactions', icon: <CreditCard className="w-5 h-5" />, badge: unreadNotifications > 0 ? `${unreadNotifications}` : undefined },
        { id: 'budget' as Screen, label: 'Budget', icon: <PieChart className="w-5 h-5" /> },
        { id: 'reports' as Screen, label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
      ]
    },
    {
      title: 'Wealth Building',
      items: [
        { id: 'goals' as Screen, label: 'Goals & Savings', icon: <Target className="w-5 h-5" /> },
        { id: 'portfolio' as Screen, label: 'Portfolio', icon: <TrendingUp className="w-5 h-5" />, badge: 'New' },
        { id: 'credit' as Screen, label: 'Financial Health', icon: <Activity className="w-5 h-5" /> }
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'bills' as Screen, label: 'Bills & Subscriptions', icon: <Receipt className="w-5 h-5" />, badge: pendingBillsCount > 0 ? `${pendingBillsCount}` : undefined },
        { id: 'taxes' as Screen, label: 'Tax Management', icon: <FileText className="w-5 h-5" /> },
        { id: 'insurance' as Screen, label: 'Insurance', icon: <Shield className="w-5 h-5" /> }
      ]
    },
    {
      title: 'Learn & Grow',
      items: [
        { id: 'education' as Screen, label: 'Financial Education', icon: <GraduationCap className="w-5 h-5" /> },
        { id: 'marketplace' as Screen, label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" /> },
        { id: 'community' as Screen, label: 'Community', icon: <Users className="w-5 h-5" /> }
      ]
    }
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleNavigation = (screen: Screen) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-full w-64 bg-card/80 dark:bg-card-dark/90 backdrop-blur-xl border-r border-border z-40 
                 transform transition-transform duration-300 ease-in-out lg:translate-x-0
                 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-lg text-foreground dark:text-foreground-dark">KeshFlow</h2>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">Financial Freedom</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-12 h-12">
              <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-foreground dark:text-foreground-dark">{userName}</h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">{membership}</p>
            </div>
            <Bell className="w-4 h-4 text-muted-foreground dark:text-muted-foreground-dark" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground transition-colors mb-2"
              >
                {expandedSections.includes(section.title) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {section.title.toUpperCase()}
              </button>
              
              {expandedSections.includes(section.title) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  {section.items.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group text-sm
                                ${currentScreen === item.id 
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 dark:bg-primary-dark dark:text-primary-foreground-dark' 
                                  : 'hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-muted-dark dark:text-muted-foreground-dark'}`
                      }
                    >
                      <span className={`transition-transform group-hover:scale-110 ${currentScreen === item.id ? 'text-primary-foreground dark:text-primary-foreground-dark' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant={item.badge === 'New' ? 'default' : 'secondary'} className="h-4 px-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground text-sm" onClick={() => handleNavigation('profile')}>
            <User className="w-4 h-4" /> Profile
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground text-sm" onClick={() => handleNavigation('support')}>
            <HelpCircle className="w-4 h-4" /> Help & Support
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm" onClick={() => { onLogout?.(); onClose(); }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default WebSidebar;
