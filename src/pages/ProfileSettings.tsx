import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, Bell, Shield, Palette, Camera } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';
import { type Screen } from '../App';
import { db, auth, storage } from '../firebase/config'; // Firebase initialized
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from '../lib/toast';
import '../lib/toast.css';

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
        toast("No signed-in user found", { type: "error" });
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
        toast("Failed to load profile", { type: "error" });
      }
    };
    fetchProfile();
  }, [userEmail]);

  // Save personal info
  const handleSaveProfile = async () => {
    if (!userEmail) return;
    try {
      const docRef = doc(db, "users", userEmail);
      // Cast to any to satisfy Firestore typing while keeping the same object shape
      await updateDoc(docRef, profile as any);
      toast("Profile updated successfully!", { type: "success" });
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast("Failed to update profile", { type: "error" });
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
      toast("Profile picture updated!", { type: "success" });
    } catch (error) {
      console.error(error);
      toast("Failed to upload profile picture", { type: "error" });
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
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) handleUploadPhoto(file);
                }}
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
          <Card className="p-6 hover:shadow-lg transition-all">
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
              <div>
                <div className="mb-3">
                  <div className="text-sm font-medium">{profile.name || 'No name set'}</div>
                  <div className="text-xs text-muted-foreground">{profile.email}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            )}
          </Card>

          {/* Notifications */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <Bell className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="font-semibold mb-2">Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your notification preferences
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Receive updates and news</div>
              </div>
              <input
                type="checkbox"
                checked={!!profile.notifications}
                onChange={(e) => {
                  const notifications = e.target.checked;
                  setProfile({ ...profile, notifications });
                  // optimistic UI: update backend
                  if (userEmail) {
                    const docRef = doc(db, "users", userEmail);
                    updateDoc(docRef, { notifications }).catch((err) => {
                      console.error(err);
                      toast("Failed to update notification setting", { type: "error" });
                    });
                  }
                }}
              />
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <Shield className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">Security</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Account security and two-factor options
            </p>
            <div className="space-y-3">
              <label className="block text-sm">
                Security Level
                <select
                  value={profile.securityLevel || 'medium'}
                  onChange={(e) => {
                    const securityLevel = e.target.value as UserProfile['securityLevel'];
                    setProfile({ ...profile, securityLevel });
                    if (userEmail) {
                      const docRef = doc(db, "users", userEmail);
                      updateDoc(docRef, { securityLevel }).catch((err) => {
                        console.error(err);
                        toast("Failed to update security level", { type: "error" });
                      });
                    }
                  }}
                  className="block w-full mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6 hover:shadow-lg transition-all">
            <Palette className="w-8 h-8 text-pink-500 mb-4" />
            <h3 className="font-semibold mb-2">Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Theme and display preferences
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Toggle dark theme</div>
              </div>
              <input
                type="checkbox"
                checked={!!profile.darkMode}
                onChange={(e) => {
                  const darkMode = e.target.checked;
                  setProfile({ ...profile, darkMode });
                  if (userEmail) {
                    const docRef = doc(db, "users", userEmail);
                      updateDoc(docRef, { darkMode }).catch((err) => {
                      console.error(err);
                      toast("Failed to update theme setting", { type: "error" });
                    });
                  }
                }}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


export default ProfileSettings;
