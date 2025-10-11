
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Settings, Bell, Shield, Palette } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { type Screen } from "../App";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

interface ProfileSettingsProps {
  onNavigate: (screen: Screen) => void;
}

export function ProfileSettings({ onNavigate }: ProfileSettingsProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    notifications: true,
    darkMode: false,
  });

  // 🔥 Load user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setProfileData((prev) => ({
            ...prev,
            ...docSnap.data(),
            email: currentUser.email || "",
          }));
        } else {
          // Create user doc if not exists
          await setDoc(userRef, {
            displayName: currentUser.displayName || "",
            email: currentUser.email,
            phone: "",
            notifications: true,
            darkMode: false,
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🧠 Update profile info
  const handleProfileUpdate = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phone: profileData.phone,
      });
      await updateProfile(user, { displayName: profileData.displayName });
      toast.success("Profile updated successfully 🎉");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile 😞");
    }
  };

  // 🔔 Manage Notifications
  const handleNotificationToggle = async () => {
    if (!user) return;
    try {
      const newStatus = !profileData.notifications;
      setProfileData((prev) => ({ ...prev, notifications: newStatus }));
      await updateDoc(doc(db, "users", user.uid), { notifications: newStatus });
      toast.success(
        newStatus
          ? "Notifications enabled 🔔"
          : "Notifications turned off 🔕"
      );
    } catch {
      toast.error("Could not update notification preferences 😞");
    }
  };

  // 🎨 Toggle Dark Mode
  const handleThemeToggle = async () => {
    if (!user) return;
    try {
      const newTheme = !profileData.darkMode;
      setProfileData((prev) => ({ ...prev, darkMode: newTheme }));
      await updateDoc(doc(db, "users", user.uid), { darkMode: newTheme });
      toast.success(
        newTheme
          ? "Dark mode enabled 🌙"
          : "Light mode enabled ☀️"
      );
      document.documentElement.classList.toggle("dark", newTheme);
    } catch {
      toast.error("Failed to change theme");
    }
  };

  // 🛡️ Security: Reset Password
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Password reset email sent ✅");
    } catch {
      toast.error("Failed to send password reset email ❌");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Profile & Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* 👤 Personal Information */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <User className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Update your profile details and contact information
            </p>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) =>
                  setProfileData({ ...profileData, displayName: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Full Name"
              />
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Phone Number"
              />
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full p-2 border rounded-lg bg-muted text-sm"
              />
            </div>
            <Button variant="default" size="sm" onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </Card>

          {/* 🔔 Notifications */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <Bell className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your notification preferences
            </p>
            <Button
              variant={profileData.notifications ? "default" : "outline"}
              size="sm"
              onClick={handleNotificationToggle}
            >
              {profileData.notifications ? "Disable Notifications" : "Enable Notifications"}
            </Button>
          </Card>

          {/* 🛡️ Security */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <Shield className="w-8 h-8 text-red-500 mb-4" />
            <h3 className="font-semibold mb-2">Security & Privacy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your security settings and privacy controls
            </p>
            <Button variant="outline" size="sm" onClick={handlePasswordReset}>
              Reset Password
            </Button>
          </Card>

          {/* 🎨 Appearance */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <Palette className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-semibold mb-2">Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the look and feel of your app
            </p>
            <Button
              variant={profileData.darkMode ? "default" : "outline"}
              size="sm"
              onClick={handleThemeToggle}
            >
              {profileData.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </Button>
          </Card>
        </motion.div>

        {/* Coming Soon Notice */}
        <Card className="p-8 text-center bg-muted/30">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Settings Panel Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working on a comprehensive settings panel where you can customize 
            every aspect of your <strong>KeshFlow</strong> experience.
          </p>
        </Card>
      </div>
    </div>
  );
}
