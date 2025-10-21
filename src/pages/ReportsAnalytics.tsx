

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Edit3,
} from "lucide-react";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

interface ReportsAnalyticsProps {
  onBack: () => void;
}

interface ExpenseItem {
  id: string;
  name: string;
  value: number;
  color: string;
  createdAt?: Timestamp;
}

interface MonthlyItem {
  id: string;
  month: string;
  income: number;
  expenses: number;
}

interface TrendItem {
  id: string;
  day: string;
  amount: number;
}

export function ReportsAnalytics({ onBack }: ReportsAnalyticsProps) {
  const [currentMonth, setCurrentMonth] = useState(8);
  const [viewType, setViewType] = useState<"pie" | "bar" | "trend">("pie");

  // Live data
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyItem[]>([]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);

  // Editing modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showModal, setShowModal] = useState(false);

  const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  const totalIncome = 450000; // default for summary calculations

  // --- Firebase subscriptions ---
  useEffect(() => {
    const unsubExpenses = onSnapshot(collection(db, "expenses"), (snapshot) => {
      setExpenseData(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ExpenseItem) })));
    });
    const unsubMonthly = onSnapshot(collection(db, "monthlyData"), (snapshot) => {
      setMonthlyData(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as MonthlyItem) })));
    });
    const unsubTrend = onSnapshot(collection(db, "trendData"), (snapshot) => {
      setTrendData(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as TrendItem) })));
    });
    return () => {
      unsubExpenses(); unsubMonthly(); unsubTrend();
    }
  }, []);

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = (savings / totalIncome) * 100;

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev" && currentMonth > 0) setCurrentMonth(currentMonth - 1);
    else if (direction === "next" && currentMonth < 11) setCurrentMonth(currentMonth + 1);
  };

  // --- Edit/Add handlers ---
  const handleEdit = (item: any, type: "expense" | "monthly" | "trend") => {
    setEditingItem({ ...item, type });
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      const collectionName = editingItem.type === "expense" ? "expenses" :
                             editingItem.type === "monthly" ? "monthlyData" : "trendData";
      const docRef = doc(db, collectionName, editingItem.id);
      const payload = { ...formData };
      if (editingItem.type === "expense") payload.value = parseFloat(payload.value);
      if (editingItem.type === "monthly") {
        payload.income = parseFloat(payload.income);
        payload.expenses = parseFloat(payload.expenses);
      }
      if (editingItem.type === "trend") payload.amount = parseFloat(payload.amount);
      await updateDoc(docRef, payload);
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (err) {
      console.error(err);
    }
  };

  const renderChart = () => {
    switch (viewType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {expenseData.map((entry,index)=><Cell key={index} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Bar dataKey="income" fill="#00796B" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" fill="#FF7043" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "trend":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Line type="monotone" dataKey="amount" stroke="#1E88E5" strokeWidth={3} dot={{ fill: "#1E88E5", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E8F5E8] pb-6">
      {/* HEADER + NAVIGATION */}
      <div className="bg-gradient-to-r from-[#00796B] to-[#1E88E5] p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={onBack} className="text-white mr-4"><ArrowLeft size={24}/></button>
            <h1 className="text-white text-xl">Reports & Analytics</h1>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="text-white" size={20}/>
          </button>
        </div>
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <button onClick={()=>navigateMonth("prev")} className="text-white/70 hover:text-white" disabled={currentMonth===0}><ChevronLeft size={24}/></button>
          <div className="text-center">
            <h2 className="text-white text-lg">{months[currentMonth]} 2024</h2>
            <p className="text-white/70 text-sm">Financial Overview</p>
          </div>
          <button onClick={()=>navigateMonth("next")} className="text-white/70 hover:text-white" disabled={currentMonth===11}><ChevronRight size={24}/></button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 rounded-2xl shadow-lg text-center"><TrendingUp className="text-green-500" size={20}/><p className="text-xs text-gray-600 mb-1">Income</p><p className="text-green-500">MWK {totalIncome.toLocaleString()}</p></Card>
          <Card className="p-4 rounded-2xl shadow-lg text-center"><TrendingDown className="text-red-500" size={20}/><p className="text-xs text-gray-600 mb-1">Expenses</p><p className="text-red-500">MWK {totalExpenses.toLocaleString()}</p></Card>
          <Card className="p-4 rounded-2xl shadow-lg text-center"><div className="w-5 h-5 bg-[#00796B] rounded-full"></div><p className="text-xs text-gray-600 mb-1">Savings</p><p className="text-[#00796B]">MWK {savings.toLocaleString()}</p></Card>
        </div>

        {/* Chart View Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[
            { key: "pie", label: "Categories" },
            { key: "bar", label: "Trends" },
            { key: "trend", label: "Daily" },
          ].map(option => (
            <button key={option.key} onClick={()=>setViewType(option.key as any)} className={`flex-1 py-3 px-4 rounded-xl transition-all text-sm ${viewType===option.key?"bg-white text-[#00796B] shadow-sm":"text-gray-600"}`}>{option.label}</button>
          ))}
        </div>

        {/* Chart */}
        <Card className="p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-800">{viewType==="pie"?"Spending by Category":viewType==="bar"?"Income vs Expenses":"Daily Spending Trend"}</h3>
            <button className="text-[#00796B]"><Filter size={20}/></button>
          </div>
          <motion.div key={viewType} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.3}}>
            {renderChart()}
          </motion.div>
        </Card>

        {/* Editable Lists */}
        {viewType==="pie" && (
          <Card className="p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-800 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {expenseData.map((cat)=><div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3"><div className="w-4 h-4 rounded-full" style={{backgroundColor:cat.color}}/><span className="text-sm text-gray-700">{cat.name}</span></div>
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-gray-800">MWK {cat.value.toLocaleString()}</p>
                  <button onClick={()=>handleEdit(cat,"expense")}><Edit3 size={16} className="text-[#00796B]"/></button>
                </div>
              </div>)}
            </div>
          </Card>
        )}

        {viewType==="bar" && (
          <Card className="p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-800 mb-4">Monthly Data</h3>
            <div className="space-y-3">
              {monthlyData.map(m=><div key={m.id} className="flex items-center justify-between">
                <span className="text-gray-700">{m.month}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-green-500">MWK {m.income.toLocaleString()}</span>
                  <span className="text-sm text-red-500">MWK {m.expenses.toLocaleString()}</span>
                  <button onClick={()=>handleEdit(m,"monthly")}><Edit3 size={16} className="text-[#00796B]"/></button>
                </div>
              </div>)}
            </div>
          </Card>
        )}

        {viewType==="trend" && (
          <Card className="p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-800 mb-4">Daily Trend Data</h3>
            <div className="space-y-3">
              {trendData.map(t=><div key={t.id} className="flex items-center justify-between">
                <span className="text-gray-700">Day {t.day}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-800">MWK {t.amount.toLocaleString()}</span>
                  <button onClick={()=>handleEdit(t,"trend")}><Edit3 size={16} className="text-[#00796B]"/></button>
                </div>
              </div>)}
            </div>
          </Card>
        )}
      </div>

      {/* Universal Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 rounded-2xl shadow-lg w-80 bg-white space-y-4">
            <h3 className="text-gray-800">{editingItem?.type==="expense"?"Edit Expense":editingItem?.type==="monthly"?"Edit Monthly Data":"Edit Trend Data"}</h3>
            
            {editingItem?.type==="expense" && <>
              <input className="w-full border p-2 rounded" placeholder="Name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Amount" type="number" value={formData.value} onChange={e=>setFormData({...formData,value:e.target.value})} />
              <input type="color" value={formData.color} onChange={e=>setFormData({...formData,color:e.target.value})} className="w-full h-10 rounded"/>
            </>}

            {editingItem?.type==="monthly" && <>
              <input className="w-full border p-2 rounded" placeholder="Month" value={formData.month} onChange={e=>setFormData({...formData,month:e.target.value})}/>
              <input className="w-full border p-2 rounded" placeholder="Income" type="number" value={formData.income} onChange={e=>setFormData({...formData,income:e.target.value})}/>
              <input className="w-full border p-2 rounded" placeholder="Expenses" type="number" value={formData.expenses} onChange={e=>setFormData({...formData,expenses:e.target.value})}/>
            </>}

            {editingItem?.type==="trend" && <>
              <input className="w-full border p-2 rounded" placeholder="Day" value={formData.day} onChange={e=>setFormData({...formData,day:e.target.value})}/>
              <input className="w-full border p-2 rounded" placeholder="Amount" type="number" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})}/>
            </>}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>Update</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


export default ReportsAnalytics;
