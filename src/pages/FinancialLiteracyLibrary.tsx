

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../components/Figma/ImageWithFallBack';
import { ArrowLeft, ChevronRight, BookOpen, TrendingUp, PiggyBank, CreditCard, Target } from 'lucide-react';
import { db, auth } from '../firebase/config';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface FinancialLiteracyLibraryProps {
  onBack: () => void;
}

interface Topic {
  id: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundImage: string;
  title: Record<'en' | 'ny' | 'to', string>;
  content: Record<'en' | 'ny' | 'to', string>;
}

export function FinancialLiteracyLibrary({ onBack }: FinancialLiteracyLibraryProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ny' | 'to'>('en');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Track user auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ny', name: 'Chichewa', flag: '🇲🇼' },
    { code: 'to', name: 'Tonga', flag: '🇲🇼' }
  ];

  const topics: Topic[] = [
    {
      id: 'budgeting',
      icon: TrendingUp,
      color: 'bg-blue-500',
      backgroundImage: '/assets/BlackCouple.jpg', // Updated image from assets folder
      title: { en: 'Budgeting Basics', ny: 'Maziko a Bajeti', to: 'Tulubanga lwa Bajeti' },
      content: {
        en: 'A budget is a plan for your money. It helps you track income and expenses so you can save money and avoid debt.',
        ny: 'Bajeti ndi dongosolo la ndalama zanu. Limathandiza kutsatira ndalama zomwe mukutenga ndi zomwe mukugwiritsa ntchito kuti muthe kusunga ndalama ndi kupewa ngongole.',
        to: 'Bajeti ni ciindi ca ndalama zanu. Cinokulindilani kuona ndalama zyomwe mukupeza akale ncimwe mukugwiiska ntcito kuti mukafune kubiika ndalama akale kupewa ngongole.'
      }
    },
    // Add other topics (saving, debt, investment) similarly...
  ];

  const logTopicView = async (topicId: string) => {
    if (!user) return;
    try {
      const topicRef = doc(collection(db, 'users', user.uid, 'topicViews'));
      await setDoc(topicRef, { topicId, timestamp: serverTimestamp() });
    } catch (error) {
      console.error('Error logging topic view:', error);
    }
  };

  if (selectedTopic) {
    const topic = topics.find(t => t.id === selectedTopic);
    const Icon = topic?.icon || BookOpen;

    useEffect(() => {
      if (topic) logTopicView(topic.id);
    }, [topic]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <div className="bg-gradient-to-r from-primary to-chart-2 p-6 pt-12 rounded-b-3xl shadow-lg flex items-center">
          <button onClick={() => setSelectedTopic(null)} className="text-primary-foreground mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-poppins text-primary-foreground text-xl">{topic?.title[selectedLanguage]}</h1>
        </div>

        <div className="p-6">
          <Card className="rounded-2xl shadow-lg bg-card border border-border overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback src={topic?.backgroundImage || ''} alt={topic?.title[selectedLanguage] || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center mb-2">
                <div className={`w-12 h-12 ${topic?.color} rounded-xl flex items-center justify-center mr-3 shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h2 className="font-poppins text-xl text-white">{topic?.title[selectedLanguage]}</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-card-foreground text-base leading-relaxed">{topic?.content[selectedLanguage]}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="bg-gradient-to-r from-primary to-chart-2 p-6 pt-12 rounded-b-3xl shadow-lg flex items-center">
        <button onClick={onBack} className="text-primary-foreground mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-poppins text-primary-foreground text-xl">Financial Literacy</h1>
      </div>

      <div className="flex space-x-2 p-6">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLanguage(lang.code as 'en' | 'ny' | 'to')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              selectedLanguage === lang.code ? 'bg-primary-foreground text-primary' : 'bg-primary-foreground/20 text-primary-foreground'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </motion.button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <motion.div key={topic.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="rounded-2xl shadow-lg bg-card border border-border cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden"
                onClick={() => setSelectedTopic(topic.id)}
              >
                <div className="relative h-32 overflow-hidden">
                  <ImageWithFallback src={topic.backgroundImage} alt={topic.title[selectedLanguage]} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center justify-center w-10 h-10 rounded-lg shadow-lg" style={{ backgroundColor: topic.color }}>
                    <Icon className="text-white" size={20} />
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-poppins text-card-foreground text-lg mb-2">{topic.title[selectedLanguage]}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {selectedLanguage === 'en' ? 'Learn More' : selectedLanguage === 'ny' ? 'Phunzirani Zambiri' : 'Munkwanisye Kuphunziila'}
                    </Badge>
                  </div>
                  <ChevronRight className="text-muted-foreground ml-2" size={20} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


export default FinancialLiteracyLibrary;


export { Icon };
