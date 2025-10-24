
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { BillCard } from "../components/BillCard";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Clock,
  Receipt,
  DollarSign,
  CheckCircle,
  Plus
} from "lucide-react";

export function BillsSubscriptions() {
  const [bills, setBills] = useState<any[]>([]);
  const [view, setView] = useState<"calendar" | "list">("list");

  // Fetch bills from Firebase
  const fetchBills = async () => {
    const snapshot = await getDocs(collection(db, "bills"));
    const billsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setBills(billsData);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleToggleAutopay = async (id: string, value: boolean) => {
    await updateDoc(doc(db, "bills", id), { autopay: value });
    fetchBills();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "bills", id));
    fetchBills();
  };

  const handleEdit = (id: string) => console.log("Edit", id);
  const handleTogglePause = (id: string) => console.log("Pause/Play", id);

  const billsStats = [
    { title: "Monthly Bills Total", value: "MWK 85,000", change: "+5.2%", icon: <Receipt className="w-5 h-5" />, color: "text-blue-500" },
    { title: "Due This Week", value: "3 Bills", change: "MWK 25,000", icon: <Clock className="w-5 h-5" />, color: "text-orange-500" },
    { title: "Auto-Pay Enabled", value: "8 Bills", change: "67% of total", icon: <CheckCircle className="w-5 h-5" />, color: "text-green-500" },
    { title: "Avg. Monthly Savings", value: "MWK 12,000", change: "+8.3%", icon: <DollarSign className="w-5 h-5" />, color: "text-purple-500" },
  ];

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const upcomingBills = bills
    .filter((bill) => bill.status === "pending" || bill.status === "upcoming")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          Bills & Subscriptions
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {billsStats.map((stat, idx) => (
          <Card
            key={idx}
            className="flex items-center gap-4 p-4 bg-card border border-border hover:shadow-md transition"
          >
            <div
              className={`p-3 rounded-xl bg-muted/30 dark:bg-muted/50 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setView("list")}
            variant={view === "list" ? "default" : "outline"}
          >
            List
          </Button>
          <Button
            onClick={() => setView("calendar")}
            variant={view === "calendar" ? "default" : "outline"}
          >
            Calendar
          </Button>
        </div>
        <Button variant="default">
          <Plus className="w-4 h-4 mr-1" /> Add Bill
        </Button>
      </div>

      {/* Bills List */}
      <motion.div layout className="space-y-4">
        {view === "list" &&
          bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onToggleAutopay={handleToggleAutopay}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onTogglePause={handleTogglePause}
            />
          ))}
        {view === "calendar" && (
          <Card className="p-6 text-center text-muted-foreground">
            Calendar view coming soon...
          </Card>
        )}
      </motion.div>

      {/* Upcoming Bills */}
      <div>
        <h2 className="font-semibold text-xl mb-3 text-foreground">
          Upcoming Bills
        </h2>
        <div className="space-y-2">
          {upcomingBills.map((bill) => (
            <Card
              key={bill.id}
              className="flex justify-between items-center p-4 bg-card border border-border"
            >
              <div>
                <p className="font-medium text-foreground">{bill.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDueDate(bill.dueDate)}
                </p>
              </div>
              <p className="font-bold text-primary">{bill.amount}</p>
            </Card>
          ))}
          {upcomingBills.length === 0 && (
            <p className="text-muted-foreground">No upcoming bills</p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h2 className="font-semibold text-xl mb-3 text-foreground">Tips</h2>
        <Card className="p-5 bg-card border border-border">
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Always pay bills before due date to avoid penalties.</li>
            <li>Enable auto-pay for recurring bills for convenience.</li>
            <li>
              Chichewa Tip:{" "}
              <i>"Sungani ndalama zonse m'tsogolo"</i> – Save for the future.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default BillsSubscriptions;
