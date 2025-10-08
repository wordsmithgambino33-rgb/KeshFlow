
"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, CreditCard, PieChart,
  Calendar, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Plus, Eye, Download, Filter
} from 'lucide-react';
import { Card } from '../ui/card'
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'react-hot-toast';
import { 
  collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { type Screen } from '../App';

interface Transaction {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  icon: string;
}

interface BudgetCategory {
  id?: string;
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  color: string;
}

interface Goal {
  id?: string;
  name: string;
  current: number;
  target: number;
  percentage: number;
  deadline: string;
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  icon: React.ReactNode;
}

interface WebDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function WebDashboard({ onNavigate }: WebDashboardProps) {
  const [stats, setStats] = useState([
    {
      title: "Total Balance",
      value: "MWK 0",
      change: "+0%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-500"
    },
    {
      title: "Monthly Income",
      value: "MWK 0",
      change: "+0%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-500"
    },
    {
      title: "Monthly Expenses",
      value: "MWK 0",
      change: "-0%",
      trend: "down",
      icon: <TrendingDown className="w-5 h-5" />,
      color: "text-orange-500"
    },
    {
      title: "Savings Rate",
      value: "0%",
      change: "+0%",
      trend: "up",
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-500"
    }
  ]);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchData = async () => {
    try {
      // Transactions
      const transQuery = query(collection(db, "transactions"), orderBy("date", "desc"));
      onSnapshot(transQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setRecentTransactions(data);
        calculateStats(data);
      });

      // Budgets
      const budgetsQuery = collection(db, "budgets");
      onSnapshot(budgetsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetCategory));
        setBudgetCategories(data);
        generateInsights(data);
      });

      // Goals
      const goalsQuery = collection(db, "goals");
      onSnapshot(goalsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
        setGoals(data);
      });

    } catch (error) {
      toast.error("Failed to fetch data from Firebase");
      console.error(error);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income ? Math.round(((income - expenses) / income) * 100) : 0;

    setStats([
      { ...stats[0], value: `MWK ${balance.toLocaleString()}`, change: balance >= 0 ? `+${savingsRate}%` : `-${savingsRate}%` },
      { ...stats[1], value: `MWK ${income.toLocaleString()}`, change: "+0%", trend: "up" },
      { ...stats[2], value: `MWK ${expenses.toLocaleString()}`, change: "+0%", trend: "down" },
      { ...stats[3], value: `${savingsRate}%`, change: "+0%", trend: "up" }
    ]);
  };

  const generateInsights = (budgets: BudgetCategory[]) => {
    const newInsights: Insight[] = [];
    budgets.forEach(b => {
      const percentUsed = Math.round((b.spent / b.budget) * 100);
      if (percentUsed >= 90) {
        newInsights.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `${b.name} spending is ${percentUsed}% of budget`,
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />
        });
      }
    });
    if (newInsights.length === 0) {
      newInsights.push({
        type: 'success',
        title: 'Great Job!',
        message: "You're under budget this month",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      });
    }
    setInsights(newInsights);
  };

  // Add new transaction (used by budget creator)
  const addTransaction = async (transaction: Transaction) => {
    try {
      await addDoc(collection(db, "transactions"), transaction);
      toast.success("Transaction added!");
    } catch (error) {
      toast.error("Failed to add transaction");
      console.error(error);
    }
  };

  // Add new budget
  const addBudget = async (budget: BudgetCategory) => {
    try {
      await addDoc(collection(db, "budgets"), budget);
      toast.success("Budget category added!");
    } catch (error) {
      toast.error("Failed to add budget category");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold">Welcome back, Wordsmith Gambino! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your finances today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => onNavigate('transactions')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate('transactions')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 
