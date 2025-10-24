
"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export function SupermarketDashboard() {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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

  const WebDashboardHeader = ({ user }: { user: any }) => (
    <header className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">
        Welcome{user?.displayName ? `, ${user.displayName}` : ""}
      </h1>
    </header>
  );

  const SupermarketCategoriesList = ({
    selectedCategory,
    onCategorySelect,
  }: {
    selectedCategory: string;
    onCategorySelect: (id: string) => void;
  }) => {
    const categories = [
      { id: "groceries", name: "Groceries" },
      { id: "produce", name: "Produce" },
      { id: "bakery", name: "Bakery" },
    ];
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onCategorySelect(c.id)}
            className={`p-3 rounded border transition-colors duration-300 ${
              selectedCategory === c.id
                ? "bg-primary text-white dark:bg-primary-dark dark:text-primary-foreground-dark"
                : "bg-card text-foreground dark:bg-card-dark dark:text-foreground-dark"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark transition-colors duration-300">
      <WebDashboardHeader user={user} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Select Supermarket Category</h2>
        <SupermarketCategoriesList
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </section>
    </div>
  );
}

export default SupermarketCategories;
