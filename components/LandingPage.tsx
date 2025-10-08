
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Target,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  BarChart3,
  PiggyBank,
  CreditCard,
  Award,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ThemeToggle } from "../ui/ThemeToggle";

import { auth, db } from "../firebase/config"; // <-- make sure this path & exports match your project
import {
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  query,
  getDocs,
  DocumentData,
} from "firebase/firestore";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export function LandingPage({ onGetStarted, onSignUp }: LandingPageProps) {
  // --- UI defaults (your original values kept intact as fallback) ---
  const defaultHeroBalance = 150000;
  const defaultProgressPct = 75;
  const defaultGoalsCount = 3;
  const defaultSavingsChange = 12; // percent

  const defaultStats = [
    { number: "10K+", label: "Active Users" },
    { number: "MWK 50M+", label: "Money Managed" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "Support" },
  ];

  const defaultTestimonials = [
    {
      name: "Grace Mwale",
      role: "Teacher, Lilongwe",
      content:
        "KeshFlow helped me save for my children's school fees. The Chichewa support makes it so easy to use!",
      rating: 5,
    },
    {
      name: "Lusekero Mtambo",
      role: "Business Owner, Mzuzu",
      content:
        "Perfect for tracking my small business expenses and planning for growth. The ganyu tracking feature is brilliant!",
      rating: 5,
    },
    {
      name: "Ben Kandapo",
      role: "Student, Blantyre",
      content:
        "Simple, beautiful, and designed for us Malawians. Finally, a budgeting app that understands our culture!",
      rating: 5,
    },
  ];

  const features = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Smart Budgeting",
      description:
        "AI-powered budget recommendations tailored for Malawian lifestyle and expenses",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal Tracking",
      description:
        "Set and achieve financial goals with visual progress tracking and smart insights",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Expense Analytics",
      description:
        "Detailed reports and analytics to understand your spending patterns",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description:
        "Bank-level security with local data storage and privacy protection",
    },
  ];

  // --- Reactive state for live data ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  // User-specific display values (fallback to defaults)
  const [heroBalance, setHeroBalance] = useState<number>(defaultHeroBalance);
  const [progressPct, setProgressPct] = useState<number>(defaultProgressPct);
  const [goalsCount, setGoalsCount] = useState<number>(defaultGoalsCount);
  const [savingsChange, setSavingsChange] = useState<number>(defaultSavingsChange);

  // Aggregate app stats (fetched from Firestore if available)
  const [stats, setStats] = useState(defaultStats);

  // Testimonials (fetched or defaults)
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  // Loading / error states
  const [loadingAppStats, setLoadingAppStats] = useState<boolean>(true);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(false);

  // -------------------------
  // Firestore helpers
  // -------------------------
  const fetchAppStats = useCallback(async () => {
    setLoadingAppStats(true);
    try {
      // Look for a summary doc at collection('appStats').doc('summary')
      const summaryRef = doc(db, "appStats", "summary");
      const summarySnap = await getDoc(summaryRef);
      if (summarySnap.exists()) {
        const data = summarySnap.data();
        // The shape is up to you; we try to map common fields
        const mappedStats = [
          {
            number: data?.activeUsersDisplay ?? data?.activeUsers ?? defaultStats[0].number,
            label: data ?.activeUsersLabel ?? defaultStats[0].label,
          },
          {
            number:
              data?.moneyManagedDisplay ??
              `MWK ${Number(data?.moneyManaged ?? 0).toLocaleString()}` ??
              defaultStats[1].number,
            label: data?.moneyManagedLabel ?? defaultStats[1].label,
          },
          {
            number: data?.satisfactionDisplay ?? `${data?.satisfaction ?? 95}%`,
            label: data?.satisfactionLabel ?? defaultStats[2].label,
          },
          {
            number: data?.supportDisplay ?? defaultStats[3].number,
            label: data?.supportLabel ?? defaultStats[3].label,
          },
        ];
        setStats(mappedStats);
      } else {
        // fallback to defaults
        setStats(defaultStats);
      }

      // Testimonials collection fallback
      try {
        const testimonialsCol = collection(db, "testimonials");
        const q = query(testimonialsCol);
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docs: any[] = snapshot.docs.map((d) => d.data());
          if (docs.length > 0) setTestimonials(docs);
        }
      } catch (err) {
        // ignore; keep defaults
        console.warn("No testimonials collection or read error:", err);
      }
    } catch (err) {
      console.error("fetchAppStats failed:", err);
      setStats(defaultStats);
    } finally {
      setLoadingAppStats(false);
    }
  }, []);

  const subscribeToUserData = useCallback(
    (u: FirebaseUser) => {
      setLoadingUserData(true);

      // Preferred user doc patterns:
      // 1) users/{uid}/profile
      // 2) users/{uid}/financialData/profile
      const profileDoc = doc(db, "users", u.uid, "financialData", "profile");
      const unsubscribeProfile = onSnapshot(
        profileDoc,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as DocumentData;
            // Map fields if they exist; keep current values as fallback
            if (typeof data.balance !== "undefined") {
              setHeroBalance(Number(data.balance));
            }
            if (typeof data.progressPct !== "undefined") {
              setProgressPct(Number(data.progressPct));
            }
            if (typeof data.goalsCount !== "undefined") {
              setGoalsCount(Number(data.goalsCount));
            }
            if (typeof data.savingsChange !== "undefined") {
              setSavingsChange(Number(data.savingsChange));
            }
          }
          setLoadingUserData(false);
        },
        (err) => {
          console.error("user profile snapshot error:", err);
          setLoadingUserData(false);
        }
      );

      // Also try top-level user profile (if you used users/{uid}/profile)
      const altProfile = doc(db, "users", u.uid, "profile");
      const unsubscribeAlt = onSnapshot(
        altProfile,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as DocumentData;
            if (typeof data.balance !== "undefined") setHeroBalance(Number(data.balance));
            if (typeof data.progressPct !== "undefined") setProgressPct(Number(data.progressPct));
            if (typeof data.goalsCount !== "undefined") setGoalsCount(Number(data.goalsCount));
            if (typeof data.savingsChange !== "undefined") setSavingsChange(Number(data.savingsChange));
          }
        },
        (err) => {
          // ignore silently
        }
      );

      // Return unsubscribe that cleans both
      return () => {
        unsubscribeProfile();
        unsubscribeAlt();
      };
    },
    []
  );

  // -------------------------
  // Auth listener: detect user logged in/out
  // -------------------------
  useEffect(() => {
    setLoadingUser(true);
    const unsubAuth = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoadingUser(false);

        // when user present, subscribe to their data
        if (u) {
          const unsub = subscribeToUserData(u);
          // cleanup when auth changed again
          // store unsub on effect cleanup
          return () => {
            unsub();
          };
        }
      },
      (err) => {
        console.error("Auth state change error:", err);
        setUser(null);
        setLoadingUser(false);
      }
    );

    return () => unsubAuth();
  }, [subscribeToUserData]);

  // Fetch app-level stats once on mount (or whenever you want to refresh)
  useEffect(() => {
    fetchAppStats();
  }, [fetchAppStats]);

  // -------------------------
  // Handlers (keep UI handlers intact; wire to auth when appropriate)
  // -------------------------
  const handleGetStarted = async () => {
    // If user is already signed in, proceed to app
    if (auth.currentUser) {
      onGetStarted();
      return;
    }

    // If not signed in, try anonymous demo sign-in to provide live demo data and then navigate
    try {
      const cred = await signInAnonymously(auth);
      // After sign-in the auth listener will subscribe to user data
      onGetStarted();
    } catch (err) {
      console.error("Anonymous sign-in failed:", err);
      // fallback: still call onGetStarted so they can see demo UI (if you prefer)
      onGetStarted();
    }
  };

  const handleSignUp = () => {
    // call provided sign up nav if exists; otherwise try getStarted
    if (onSignUp) {
      onSignUp();
    } else {
      handleGetStarted();
    }
  };

  // -------------------------
  // Render (UI kept exactly; dynamic parts wired to state)
  // -------------------------
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12">
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
              >
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Made for Malawi 🇲🇼</span>
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-poppins font-bold text-foreground leading-tight">
                Take Control of Your
                <span className="text-primary block">Financial Future</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                KeshFlow is the first Malawian budgeting app designed specifically for our culture, supporting MWK currency,
                local income sources, and bilingual tips in English and Chichewa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSignUp} size="lg" className="text-base px-8 py-3 h-auto group">
                Sign Up Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={handleGetStarted} variant="outline" size="lg" className="text-base px-8 py-3 h-auto">
                Try Demo
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 border-2 border-background" />
                ))}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trusted by {stats[0]?.number ?? "10,000+"} Malawians</p>
                <div className="flex gap-1">
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
                    <p className="text-3xl font-bold text-primary">MWK {heroBalance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Budget Progress</span>
                      <span className="text-sm text-primary">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ delay: 1, duration: 1 }}
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

            {/* Floating elements */}
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full blur-xl" />
            <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} viewport={{ once: true }} className="text-center">
                <h3 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold mb-4">Everything You Need to Manage Your Money</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Powerful features designed specifically for Malawian users, with local context and bilingual support.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.6 }} viewport={{ once: true }}>
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold mb-4">Loved by Malawians Everywhere</h2>
            <p className="text-lg text-muted-foreground">See what our users are saying about KeshFlow</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2, duration: 0.6 }} viewport={{ once: true }}>
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-poppins font-bold">Ready to Transform Your Financial Life?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Join thousands of Malawians who are already taking control of their finances with NdalaFlow.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleSignUp} size="lg" className="text-base px-8 py-3 h-auto group">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={handleGetStarted} variant="outline" size="lg" className="text-base px-8 py-3 h-auto">Try Demo First</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="font-poppins font-bold text-xl mb-4">NdalaFlow</h3>
              <p className="text-muted-foreground mb-4 max-w-md">The first Malawian budgeting app designed specifically for our culture and needs. Take control of your financial future today.</p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-primary-foreground" /></div>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Smartphone className="w-4 h-4 text-primary-foreground" /></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground"><li>Budget Management</li><li>Goal Tracking</li><li>Expense Analytics</li><li>Financial Literacy</li></ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground"><li>Help Center</li><li>Contact Us</li><li>Privacy Policy</li><li>Terms of Service</li></ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NdalaFlow. Made with ❤️ in Malawi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
