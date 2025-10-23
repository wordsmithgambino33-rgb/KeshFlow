import React from 'react';
import { motion } from 'motion/react';
import { Home, PieChart, Target, TrendingUp, CreditCard } from 'lucide-react';
import { Screen } from '../App';
import { BudgetContext } from '../context/budget_context'; // use exported context
import { Badge } from '../ui/badge';

interface BottomNavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const budget = React.useContext(BudgetContext) as any | null;
  const { transactionCount = 0, goalCount = 0 } = budget || {};

  const navItems = [
    { id: 'dashboard' as Screen, icon: Home, label: 'Home' },
    { id: 'transactions' as Screen, icon: CreditCard, label: 'Transactions', badge: transactionCount },
    { id: 'budget' as Screen, icon: PieChart, label: 'Budget' },
    { id: 'reports' as Screen, icon: TrendingUp, label: 'Reports' },
    { id: 'goals' as Screen, icon: Target, label: 'Goals', badge: goalCount },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card rounded-t-3xl shadow-2xl border-t border-border z-50">
      <div className="flex justify-around items-center py-3 px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center space-y-1 py-2 px-3 rounded-2xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Tab Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-chart-2 rounded-2xl shadow-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative z-10">
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs relative z-10 transition-colors ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>

              {/* Badge */}
              {item.badge !== undefined && (
                <Badge
                  variant="secondary"
                  className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 text-[0.55rem] h-3 w-3 flex items-center justify-center p-0"
                >
                  {item.badge}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { BottomNavigation as ButtonNavigation };
