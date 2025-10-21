

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Car, Home, Heart, Briefcase } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { type Screen } from '../App';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

interface InsuranceHubProps {
  onNavigate: (screen: Screen) => void;
}

export function InsuranceHub({ onNavigate }: InsuranceHubProps) {
  const [user, setUser] = useState<any>(null);

  // Track user login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, { clickedInsurance: [] });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle insurance card click
  const handleInsuranceClick = async (insuranceType: string) => {
    if (!user) {
      toast.error('Please log in to track your choices.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { clickedInsurance: arrayUnion(insuranceType) });
      toast.success(`You clicked on ${insuranceType} ✅`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to track your choice 😞');
    }
  };

  const INSURANCE_OPTIONS = [
    { type: 'Life Insurance', icon: Heart, color: 'text-red-500', desc: "Protect your family's financial future" },
    { type: 'Motor Insurance', icon: Car, color: 'text-blue-500', desc: 'Comprehensive vehicle coverage' },
    { type: 'Property Insurance', icon: Home, color: 'text-green-500', desc: 'Protect your home and belongings' },
    { type: 'Business Insurance', icon: Briefcase, color: 'text-purple-500', desc: 'Safeguard your business operations' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Insurance Hub
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Protect yourself and your family with comprehensive insurance solutions tailored for Malawi.
          </p>
        </div>

        {/* Insurance Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mb-8">
            <Shield className="w-24 h-24 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Insurance Tools Coming Soon!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We're partnering with leading insurance providers in Malawi to bring you 
              comprehensive coverage options and policy management tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            {INSURANCE_OPTIONS.map((insurance) => {
              const Icon = insurance.icon;
              return (
                <Card
                  key={insurance.type}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleInsuranceClick(insurance.type)}
                >
                  <Icon className={`w-8 h-8 ${insurance.color} mx-auto mb-3`} />
                  <h3 className="font-semibold mb-2">{insurance.type}</h3>
                  <p className="text-sm text-gray-500">{insurance.desc}</p>
                </Card>
              );
            })}
          </div>

          <Button
            size="lg"
            onClick={() => toast.info('Insurance quotes feature coming soon!')}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
          >
            Get Insurance Quotes
          </Button>
        </motion.div>

        {/* Chichewa Tips */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
          <h3 className="font-semibold mb-2">🛡️ Insurance Tip / Malangizo a Chitetezo</h3>
          <p className="text-sm text-gray-600">
            <strong>English:</strong> Insurance is an investment in peace of mind. Start with basic life and health coverage, then expand as your needs grow.<br />
            <strong>Chichewa:</strong> Insurance ndi ndalama zomwe mumaika kuti mukhale ndi mtendere. Yambani ndi chitetezo cha moyo ndi thanzi, kenako onjezani monga zosowa zanu zikukula.
          </p>
        </Card>
      </div>
    </div>
  );
}


export default InsuranceHub;


export { INSURANCE_OPTIONS };
