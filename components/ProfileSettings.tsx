
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, Bell, Shield, Palette, Camera } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { type Screen } from '../App';
import { db, auth, storage } from '../firebase/config'; // Firebase initialized
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProfileSettingsProps {
  onNavigate: (screen: Screen) => void;
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  notifications?: boolean;
  darkMode?: boolean;
  securityLevel?: 'low' | 'medium' | 'high';
  photoURL?: string;
}

export function ProfileSettings({ onNavigate }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [editing, setEditing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Watch Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        toast.error("No signed-in user found");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firebase
  useEffect(() => {
    if (!userEmail) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          await setDoc(docRef, {
            name: "",
            email: userEmail,
            phone: "",
            notifications: true,
            darkMode: false,
            securityLevel: "medium",
            photoURL: ""
          });
          setProfile({
            name: "",
            email: userEmail,
            phone: "",
            notifications: true,
            darkMode: false,
            securityLevel: "medium",
            photoURL: ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [userEmail]);

  // Save personal info
  const handleSaveProfile = async () => {
    if (!userEmail) return;
    try {
      const docRef = doc(db, "users", userEmail);
      await updateDoc(docRef, profile);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  // Upload profile picture
  const handleUploadPhoto = async (file: File) => {
    if (!userEmail || !file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profilePictures/${userEmail}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      const docRef = doc(db, "users", userEmail);
      await updateDoc(docRef, { photoURL });
      setProfile({ ...profile, photoURL });
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with avatar */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={profile.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
            <label className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleUploadPhoto(e.target.files[0])}
              />
            </label>
          </div>

          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-1">
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
          {/* Personal Info */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <User className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Update your profile details and contact information
            </p>
            {editing ? (
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Full Name"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <Input
                  placeholder="Phone Number"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProfile}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </Card>

          {/* Notifications */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
            <Bell
