

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, CreditCard, PieChart, Target, BarChart3, Wallet, LogOut, User, Bell, HelpCircle, TrendingUp, Receipt, GraduationCap, ShoppingBag, Users, FileText, Shield, Activity, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { type Screen } from '../App';

interface MobileSidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function MobileSidebar({ currentScreen, onNavigate, isOpen, onClose, onLogout }: MobileSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Main', 'Wealth Building', 'Management', 'Learn & Grow']);
  const [pendingBillsCount, setPendingBillsCount] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    const fetchPendingBills = async () => {
      const q = query(collection(db, 'bills'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      setPendingBillsCount(snapshot.size);
    };
    const fetchUnreadNotifications = async () => {
      const q = query(collection(db, 'notifications'), where('read', '==', false));
      const snapshot = await getDocs(q);
      setUnreadNotifications(snapshot.size);
    };
    fetchPendingBills();
    fetchUnreadNotifications();
  }, []);

  const navigationSections = [
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
      prev.includes(sectionTitle) ? prev.filter(s => s !== sectionTitle) : [...prev, sectionTitle]
    );
  };

  const handleNavigation = (screen: Screen) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <motion.div 
      className={`fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-sm ${isOpen ? 'block' : 'hidden'}`}
      onClick={onClose}
    >
      <motion.div
        className="w-64 h-full bg-card/95 backdrop-blur-xl border-r border-border"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Same header + user profile + navigation as WebSidebar */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-poppins font-bold text-lg">NdalaFlow</h2>
                <p className="text-xs text-muted-foreground">Financial Freedom</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-border flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </Avatar>
              <div>
                <h3 className="font-medium">John Mwale</h3>
                <p className="text-sm text-muted-foreground">Premium Member</p>
              </div>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationSections.map(section => (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  {expandedSections.includes(section.title) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {section.title.toUpperCase()}
                </button>
                {expandedSections.includes(section.title) &&
                  section.items.map(item => (
                    <Button
                      key={item.id}
                      variant={currentScreen === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavigation(item.id)}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && <Badge variant={item.badge === 'New' ? 'default' : 'secondary'}>{item.badge}</Badge>}
                    </Button>
                  ))
                }
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => handleNavigation('profile')}>
              <User className="w-4 h-4" /> Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => handleNavigation('support')}>
              <HelpCircle className="w-4 h-4" /> Help & Support
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={() => { onLogout?.(); onClose(); }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default MobileSidebar;
