
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Target,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import ThemeToggle from '../ui/ThemeToggle';
import { auth, db } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Skeleton } from '../ui/skeleton';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export function LandingPage({ onGetStarted, onSignUp }: LandingPageProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalMoneyManaged: 0,
    userSatisfaction: 0,
    supportAvailability: '24/7'
  });

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      toast.success('Demo session started! ✅');
      onGetStarted();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Demo failed. Please try again.');
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
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
        } catch (err: any) {
          console.error(err);
          setError('Failed to load user data.');
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
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
      } catch (err: any) {
        console.error(err);
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const unsubscribeStats = onSnapshot(collection(db, 'users'), () => fetchStats());
    return () => unsubscribeStats();
  }, []);

  const availableBalance = userData?.balance
    ? Number(String(userData.balance).replace(/\D/g, ''))
    : statsData.totalMoneyManaged > 0
    ? statsData.totalMoneyManaged
    : 150000;

  const budgetProgress = userData?.budgetProgress ?? 75;
  const savingsChange = userData?.savingsChange ?? 12;
  const goalsCount = userData?.goals?.length ?? 3;
  const trustedCount = Math.max(10000, statsData.totalUsers);

  const handleSignUpClick = () => {
    if (onSignUp) return onSignUp();
    return onGetStarted();
  };

  const features = [
    { icon: <Wallet className="w-6 h-6" />, title: 'Smart Budgeting', description: 'AI-powered budget recommendations tailored for Malawian lifestyle and expenses' },
    { icon: <Target className="w-6 h-6" />, title: 'Goal Tracking', description: 'Set and achieve financial goals with visual progress tracking and smart insights' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Expense Analytics', description: 'Detailed reports and analytics to understand your spending patterns' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure & Private', description: 'Bank-level security with local data storage and privacy protection' }
  ];

  const testimonials = [
    { name: 'Grace Mbewe', role: 'Teacher, Lilongwe', content: 'KeshFlow helped me save for my children’s school fees. The Chichewa support makes it so easy to use!', rating: 5 },
    { name: 'Lusekero Mwafulirwa', role: 'Business Owner, Mzuzu', content: 'Perfect for tracking my small business expenses and planning for growth. The ganyu tracking feature is brilliant!', rating: 5 },
    { name: 'Ben Ben', role: 'Student, Blantyre', content: 'Simple, beautiful, and designed for us Malawians. Finally, a budgeting app that understands our culture!', rating: 5 }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen relative overflow-hidden bg-landing-neon text-white">
      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12" aria-labelledby="hero-title">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20"
                role="alert"
              >
                <Star className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">Made for Malawi 🇲🇼</span>
              </motion.div>
              
              <h1 id="hero-title" className="text-4xl lg:text-6xl font-poppins font-bold text-foreground leading-tight">
                Take Control of Your
                <span className="text-primary block">Financial Future</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Keshflow is the first Malawian budgeting app designed specifically for our culture, 
                supporting MWK currency, local income sources, and bilingual tips in English and Chichewa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSignUpClick}
                size="lg" 
                className="text-base px-8 py-3 h-auto group"
                aria-label="Sign Up Free"
              >
                Sign Up Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
              <Button 
                onClick={handleDemo}
                variant="outline" 
                size="lg" 
                className="text-base px-8 py-3 h-auto"
                disabled={loading}
                aria-label="Try Demo"
              >
                Try Demo
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-2" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 border-2 border-background"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trusted by {trustedCount.toLocaleString()}+ Malawians</p>
                <div className="flex gap-1" aria-label="5 star rating">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 max-w-md mx-auto">
              <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-poppins font-semibold text-xl mb-2">Monthly Overview</h3>
                    <p className="text-3xl font-bold text-primary">MWK {availableBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget Progress</span>
                      <span className="text-sm text-primary">{budgetProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, budgetProgress))}%` }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold text-green-500">↑ {savingsChange}%</p>
                      <p className="text-xs text-muted-foreground">Savings</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold text-orange-500">{goalsCount}</p>
                      <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-xl"
              aria-hidden="true"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-xl"
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-12">
        {loading ? (
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
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
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 bg-muted/50">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose KeshFlow?</h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="p-6 text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full" aria-hidden="true">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-12">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-6">
              <div className="flex mb-4" aria-label={`${testimonial.rating} star rating`}>
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-label="Global support">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-label="Mobile app">
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

export default LandingPage;
