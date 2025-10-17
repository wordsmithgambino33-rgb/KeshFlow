
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Target,
  TrendingUp,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ThemeToggle } from '../ui/ThemeToggle';
import { auth, db } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export function LandingPage({ onGetStarted, onSignUp }: LandingPageProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalMoneyManaged: 0,
    userSatisfaction: 0,
    supportAvailability: '24/7'
  });

  const handleDemo = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast.success('Demo session started! ✅');
      onGetStarted();
    } catch (err) {
      console.error(err);
      toast.error('Demo failed 😔 Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'financialData', 'profile');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserData(docSnap.data());
          else setUserData(null);
        } catch (err) {
          console.error(err);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCol = collection(db, 'users');
        const usersSnap = await getDocs(usersCol);
        const totalUsers = usersSnap.size;

        let totalMoney = 0;
        let totalRating = 0;
        let ratedUsers = 0;

        usersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.financialData?.balance) {
            totalMoney += Number(data.financialData.balance?.replace(/\D/g, '')) || 0;
          }
          if (data.financialData?.rating) {
            totalRating += data.financialData.rating;
            ratedUsers += 1;
          }
        });

        const userSatisfaction = ratedUsers > 0 ? Math.round((totalRating / ratedUsers) * 20) : 95;

        setStatsData({
          totalUsers,
          totalMoneyManaged: totalMoney,
          userSatisfaction,
          supportAvailability: '24/7'
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();

    const unsubscribeStats = onSnapshot(collection(db, 'users'), () => fetchStats());
    return () => unsubscribeStats();
  }, []);

  const features = [
    { icon: <Wallet className="w-6 h-6" />, title: 'Smart Budgeting', description: 'AI-powered budget recommendations tailored for Malawian lifestyle and expenses' },
    { icon: <Target className="w-6 h-6" />, title: 'Goal Tracking', description: 'Set and achieve financial goals with visual progress tracking and smart insights' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Expense Analytics', description: 'Detailed reports and analytics to understand your spending patterns' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure & Private', description: 'Bank-level security with local data storage and privacy protection' }
  ];

  const testimonials = [
    { name: 'Grace Mbewe', role: 'Teacher, Lilongwe', content: 'KeshFlow helped me save for my children’s school fees. The Chichewa support makes it so easy to use!', rating: 5 },
    { name: 'Lusekero Mwafulirwa', role: 'Business Owner, Mzuzu', content: 'Perfect for tracking my small business expenses and planning for growth. The ganyu tracking feature is brilliant!', rating: 5 },
    { name: 'Ben Kandapo', role: 'Student, Blantyre', content: 'Simple, beautiful, and designed for us Malawians. Finally, a budgeting app that understands our culture!', rating: 5 }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative overflow-hidden bg-landing-neon text-white">
      <Toaster position="top-right" />
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4">Welcome to KeshFlow</h1>
        <p className="text-lg lg:text-2xl mb-8">Your Malawian budgeting app for smarter financial decisions.</p>
        <div className="flex gap-4">
          <Button onClick={onGetStarted} className="bg-primary text-white">Get Started</Button>
          <Button onClick={handleDemo} className="bg-secondary text-white" disabled={loading}>{loading ? 'Loading...' : 'Demo'}</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{statsData.totalUsers}+</h3>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-primary mb-2">MWK {statsData.totalMoneyManaged.toLocaleString()}</h3>
            <p className="text-muted-foreground">Money Managed</p>
          </div>
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{statsData.userSatisfaction}%</h3>
            <p className="text-muted-foreground">User Satisfaction</p>
          </div>
          <div>
            <h3 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{statsData.supportAvailability}</h3>
            <p className="text-muted-foreground">Support</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 lg:px-12 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-4">KeshFlow</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              The first Malawian budgeting app designed specifically for our culture and needs. Take control of your financial future today.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Budget Management</li>
              <li>Goal Tracking</li>
              <li>Expense Analytics</li>
              <li>Financial Literacy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} KeshFlow. Made with ❤️ in Malawi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
