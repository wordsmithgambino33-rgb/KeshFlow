import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/Input";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { FinancialLiteracyLibrary } from "../pages/FinancialLiteracyLibrary";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Car,
  GraduationCap,
  Coffee,
  Home,
  AlertTriangle,
  CheckCircle,
  Edit3,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface BudgetManagementProps {
  onBack: () => void;
}

export function EnhancedBudgetManagement({ onBack }: BudgetManagementProps) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showFinancialLibrary, setShowFinancialLibrary] = useState(false);

  // 🔥 Real-time budgets from Firestore
  useEffect(() => {
    const q = query(collection(db, "budgets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "budgets"), {
        name: newBudgetCategory,
        budget: parseFloat(newBudgetAmount),
        spent: 0,
        transactions: [],
        createdAt: new Date(),
      });
      toast.success("Budget added successfully!");
      setShowAddModal(false);
      setNewBudgetCategory("");
      setNewBudgetAmount("");
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Failed to add budget");
    }
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { status: "over", color: "text-red-500" };
    if (percentage >= 80) return { status: "warning", color: "text-yellow-500" };
    return { status: "safe", color: "text-green-500" };
  };

  const totalBudget = budgets.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = budgets.reduce((sum, cat) => sum + cat.spent, 0);

  if (showFinancialLibrary) {
    return <FinancialLiteracyLibrary onBack={() => setShowFinancialLibrary(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E8] pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00796B] to-[#1E88E5] p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={onBack} className="text-white mr-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl">Budget Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Plus className="text-white" size={20} />
          </button>
        </div>

        {/* Overall Summary */}
        <Card className="bg-white/10 backdrop-blur-sm border-0 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-white/70 text-sm">Monthly Budget</p>
              <h2 className="text-white text-2xl">MWK {totalBudget.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Spent</p>
              <h2 className="text-white text-2xl">MWK {totalSpent.toLocaleString()}</h2>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Progress</span>
              <span>{Math.round((totalSpent / totalBudget) * 100 || 0)}%</span>
            </div>
            <Progress value={(totalSpent / totalBudget) * 100 || 0} className="h-2 bg-white/20" />
          </div>

          <p className="text-white/70 text-sm">
            Remaining: MWK {(totalBudget - totalSpent).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Budget List */}
      <div className="p-6 space-y-4">
        {budgets.map((category) => {
          const Icon = ShoppingCart; // Dynamic icons can be added later
          const percentage = (category.spent / category.budget) * 100;
          const status = getBudgetStatus(category.spent, category.budget);
          const isExpanded = expandedCategory === category.id;

          return (
            <motion.div key={category.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl shadow-lg overflow-hidden">
                <motion.div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  whileHover={{ backgroundColor: "#f9f9f9" }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-[#00796B] rounded-xl flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-800">{category.name}</h3>
                        <div className="flex items-center space-x-2">
                          {status.status === "over" && <AlertTriangle className="text-red-500" size={16} />}
                          {status.status === "safe" && <CheckCircle className="text-green-500" size={16} />}
                          <span className={`text-sm ${status.color}`}>
                            {Math.round(percentage) || 0}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                      </div>

                      <div className="flex justify-between text-sm text-gray-600">
                        <span>MWK {category.spent.toLocaleString()} spent</span>
                        <span>MWK {category.budget.toLocaleString()} budget</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 bg-gray-50">
                        {category.transactions.length > 0 ? (
                          category.transactions.map((t: any, i: number) => (
                            <div key={i} className="flex justify-between py-2">
                              <div>
                                <p className="text-sm text-gray-800">{t.description}</p>
                                <p className="text-xs text-gray-500">{t.date}</p>
                              </div>
                              <span className="text-sm text-red-500">
                                -MWK {t.amount.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No transactions yet</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}

        {/* Financial Literacy Card */}
        <Card
          className="rounded-2xl shadow-lg bg-gradient-to-r from-primary to-chart-2 border-0 cursor-pointer hover:shadow-xl transition-all"
          onClick={() => setShowFinancialLibrary(true)}
        >
          <div className="p-6 flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-1">Financial Literacy Library</h3>
              <p className="text-white/80 text-sm">Learn about budgeting, saving & investments</p>
              <Badge className="mt-2 bg-white/20 text-white border-0">Available in English & Chichewa</Badge>
            </div>
            <div className="text-white">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Add Budget Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl mb-6 text-center">Add New Budget</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Category Name</label>
                  <Input
                    placeholder="e.g., Entertainment"
                    value={newBudgetCategory}
                    onChange={(e) => setNewBudgetCategory(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#00796B]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Monthly Budget Amount</label>
                  <Input
                    placeholder="e.g., 50000"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#00796B]"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBudget}
                    disabled={!newBudgetCategory || !newBudgetAmount}
                    className="flex-1 h-12 bg-gradient-to-r from-[#00796B] to-[#1E88E5] rounded-xl"
                  >
                    Add Budget
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EnhancedBudgetManagement;
