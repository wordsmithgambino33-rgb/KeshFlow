
"use client";

import React, { useState, useEffect } from "react";
import { WebDashboard } from "../pages/WebDashboard";
import { SupermarketCategories } from "./SupermarketCategories";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export function WebDashboard() {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // 🔥 Load current user and saved category
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const savedCategory = docSnap.data().selectedCategory;
          if (savedCategory) setSelectedCategory(savedCategory);
        } else {
          await setDoc(userRef, { selectedCategory: "" });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔔 Save category to Firebase when changed
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);

    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { selectedCategory: categoryId });
      toast.success(`Selected category: ${categoryId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category selection 😞");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <WebDashboardHeader user={user} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Select Supermarket Category</h2>
        <SupermarketCategories
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </section>

      {/* You can add other dashboard sections here, e.g., TransactionLogging, Charts, Community */}
    </div>
  );
}
