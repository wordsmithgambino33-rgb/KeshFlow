

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CreditCard,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { toast } from "react-hot-toast";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { type Screen } from "../App";

interface Transaction {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  icon: React.ReactNode;
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
  type: "success" | "warning" | "info";
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
      color: "text-green-500",
    },
    {
      title: "Monthly Income",
      value: "MWK 0",
      change: "+0%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      title: "Monthly Expenses",
      value: "MWK 0",
      change: "-0%",
      trend: "down",
      icon: <TrendingDown className="w-5 h-5" />,
      color: "text-orange-500",
    },
    {
      title: "Savings Rate",
      value: "0%",
      change: "+0%",
      trend: "up",
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-500",
    },
  ]);

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      // Transactions
      const transQuery = query(collection(db, "transactions"), orderBy("date", "desc"));
      onSnapshot(transQuery, (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
        );
        setRecentTransactions(data);
        calculateStats(data);
      });

      // Budgets
      const budgetsQuery = collection(db, "budgets");
      onSnapshot(budgetsQuery, (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as BudgetCategory)
        );
        setBudgetCategories(data);
        generateInsights(data);
      });

      // Goals
      const goalsQuery = collection(db, "goals");
      onSnapshot(goalsQuery, (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Goal)
        );
        setGoals(data);
      });
    } catch (error) {
      toast.error("Failed to fetch data from Firebase");
      console.error(error);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income
      ? Math.round(((income - expenses) / income) * 100)
      : 0;

    setStats([
      {
        ...stats[0],
        value: `MWK ${balance.toLocaleString()}`,
        change:
          balance >= 0 ? `+${savingsRate}%` : `-${savingsRate}%`,
      },
      {
        ...stats[1],
        value: `MWK ${income.toLocaleString()}`,
        change: "+0%",
        trend: "up",
      },
      {
        ...stats[2],
        value: `MWK ${expenses.toLocaleString()}`,
        change: "+0%",
        trend: "down",
      },
      {
        ...stats[3],
        value: `${savingsRate}%`,
        change: "+0%",
        trend: "up",
      },
    ]);
  };

  const generateInsights = (budgets: BudgetCategory[]) => {
    const newInsights: Insight[] = [];
    budgets.forEach((b) => {
      const percentUsed = Math.round((b.spent / b.budget) * 100);
      if (percentUsed >= 90) {
        newInsights.push({
          type: "warning",
          title: "Budget Alert",
          message: `${b.name} spending is ${percentUsed}% of budget`,
          icon: (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          ),
        });
      }
    });
    if (newInsights.length === 0) {
      newInsights.push({
        type: "success",
        title: "Great Job!",
        message: "You're under budget this month",
        icon: (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ),
      });
    }
    setInsights(newInsights);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, Wordsmith Gambino! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your finances today.
          </p>
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
          <Button onClick={() => onNavigate("transactions")}>
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
                <div
                  className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>
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
              <h2 className="text-xl font-semibold">
                Recent Transactions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("transactions")}
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
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                  }}
                >
                  <Card className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {transaction.icon}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}{" "}
                      MWK {transaction.amount.toLocaleString()}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Goals Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Goals
            </h2>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No goals set yet. Start by adding one!
              </p>
            ) : (
              <div className="space-y-5">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {goal.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: MWK{" "}
                          {goal.target.toLocaleString()} by{" "}
                          {goal.deadline}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {goal.percentage}%
                      </Badge>
                    </div>
                    <Progress value={goal.percentage} />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Budget Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Budget Categories
            </h2>
            {budgetCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No budget data available.
              </p>
            ) : (
              <div className="space-y-5">
                {budgetCategories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-sm">
                        MWK {cat.spent.toLocaleString()} /{" "}
                        {cat.budget.toLocaleString()}
                      </p>
                    </div>
                    <Progress
                      value={cat.percentage}
                      className={`${cat.color}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Insights */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Insights
            </h2>
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-muted p-3 rounded-lg mb-2"
              >
                {insight.icon}
                <div>
                  <p className="font-semibold">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {insight.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}


export default WebDashboard;
