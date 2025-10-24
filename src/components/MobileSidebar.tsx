
import React from 'react';
import { Home, User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="fixed inset-y-0 left-0 w-64 bg-background text-foreground shadow-lg z-50"
    >
      <div className="flex flex-col h-full p-4">
        <button
          onClick={onClose}
          className="self-end text-foreground hover:text-accent transition"
        >
          ✕
        </button>
        <nav className="mt-6 flex flex-col gap-4">
          <Button variant="ghost" className="justify-start gap-2 w-full">
            <Home className="w-5 h-5" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full">
            <User className="w-5 h-5" />
            Profile
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full text-red-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </nav>
      </div>
    </motion.div>
  );
};

export default MobileSidebar;
