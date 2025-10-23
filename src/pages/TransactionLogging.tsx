

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase/config';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import   Input  from '../ui/Input';
import Textarea from '../ui/Textarea'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Car,
  GraduationCap,
  Coffee,
  Home,
  Heart,
  Briefcase,
  DollarSign,
  Check,
  Calculator,
  Calendar,
  Tags,
  Trash2
} from 'lucide-react';

interface TransactionLoggingProps {
  onBack: () => void;
}

interface Transaction {
  id?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  date: string;
  createdAt?: any;
}

export function TransactionLogging({ onBack }: TransactionLoggingProps) {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Categories
  const incomeCategories = [
    { id: 'salary', name: 'Salary', icon: Briefcase, color: 'bg-blue-500' },
    { id: 'business', name: 'Business', icon: DollarSign, color: 'bg-green-500' },
    { id: 'ganyu', name: 'Ganyu', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'allowance', name: 'Allowance', icon: Heart, color: 'bg-pink-500' },
  ];

  const expenseCategories = [
    { id: 'market', name: 'Market', icon: ShoppingCart, color: 'bg-red-500' },
    { id: 'transport', name: 'Transport', icon: Car, color: 'bg-orange-500' },
    { id: 'school', name: 'School Fees', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'food', name: 'Food & Drinks', icon: Coffee, color: 'bg-yellow-500' },
    { id: 'rent', name: 'Rent', icon: Home, color: 'bg-gray-500' },
    { id: 'health', name: 'Health', icon: Heart, color: 'bg-green-500' },
  ];

  const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  const handleKeypadPress = (value: string) => {
    if (value === '⌫') {
      setAmount(prev => prev.slice(0, -1));
    } else if (value === '.' && !amount.includes('.')) {
      setAmount(prev => prev + value);
    } else if (value !== '.') {
      const newAmount = amount === '0' ? value : amount + value;
      setAmount(newAmount);
    }
  };

  const formatAmountWithCommas = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Fetch transactions in real-time
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, 'id'>)
      }));
      setTransactions(data);
      setLoading(false);
    }, error => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!amount || !selectedCategory) return;

    try {
      await addDoc(collection(db, 'transactions'), {
        type: transactionType,
        amount: parseFloat(amount),
        category: selectedCategory,
        note,
        date,
        createdAt: serverTimestamp()
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
        setSelectedCategory('');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      }, 2000);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="text-white" size={40} />
          </motion.div>
          <h2 className="font-poppins text-xl text-foreground mb-2">Transaction Saved!</h2>
          <p className="text-muted-foreground">Your transaction has been recorded</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-card shadow-sm border border-border"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-poppins font-bold">Add Transaction</h1>
              <p className="text-muted-foreground">Record your income or expenses</p>
            </div>
          </div>
        </div>

        {/* Transaction Type Toggle */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="font-semibold">Transaction Type</h2>
          </div>
          <div className="flex bg-muted rounded-2xl p-1 max-w-md">
            <button
              onClick={() => setTransactionType('expense')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${
                transactionType === 'expense' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              <TrendingDown size={20} />
              <span>Expense</span>
            </button>
            <button
              onClick={() => setTransactionType('income')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${
                transactionType === 'income' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            >
              <TrendingUp size={20} />
              <span>Income</span>
            </button>
          </div>
        </Card>

        {/* Grid: Left = Input, Right = Category & Notes */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Amount Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5" />
                <h3 className="font-semibold">Amount</h3>
              </div>
              <div className="text-center mb-6">
                <div className="font-poppins text-4xl lg:text-5xl text-foreground mb-4">
                  MWK {formatAmountWithCommas(amount) || '0'}
                </div>
                <p className="text-muted-foreground">
                  {transactionType === 'income' ? 'Money coming in' : 'Money going out'}
                </p>
              </div>
              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                {keypadNumbers.flat().map((num, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleKeypadPress(num)}
                    className={`
                      relative h-14 rounded-2xl text-lg font-semibold transition-all duration-200
                      ${num === '⌫' 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40'
                        : num === '0'
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 hover:shadow-primary/40 col-span-2'
                        : 'bg-gradient-to-br from-card to-muted border border-border/50 hover:border-primary/30 shadow-lg hover:shadow-xl'
                      }
                      hover:transform hover:-translate-y-1 active:translate-y-0
                      ${num === '0' ? 'w-full' : ''}
                    `}
                  >
                    <span className="relative z-10">{num}</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Quick Amounts */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quick Amounts
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['1,000', '5,000', '10,000', '20,000', '50,000', '100,000'].map((quickAmount) => (
                  <motion.div key={quickAmount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.replace(',', ''))}
                      className="w-full text-xs font-medium bg-gradient-to-br from-card to-muted/50 hover:from-primary/10 hover:to-primary/20 hover:border-primary/30 transition-all duration-200"
                    >
                      MWK {quickAmount}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Tags className="w-5 h-5" />
                <h3 className="font-semibold">Select Category</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedCategory === category.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-sm">{category.name}</p>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Notes & Date */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold">Additional Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Notes (Optional)</label>
                  <Textarea
                    placeholder="Add a note..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={onBack} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={!amount || !selectedCategory} className="flex-1">Save Transaction</Button>
            </div>
          </div>
        </div>

        {/* Transaction List with Delete */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          {loading && <p className="text-muted-foreground">Loading transactions...</p>}
          {!loading && transactions.length === 0 && <p className="text-muted-foreground">No transactions yet.</p>}
          {transactions.map(tx => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-4 flex justify-between items-center ${tx.type === 'income' ? 'border-green-400' : 'border-red-400'} border-l-4`}>
                <div className="space-y-1">
                  <p className="font-medium">{tx.category}</p>
                  {tx.note && <p className="text-sm text-muted-foreground">{tx.note}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} /> {new Date(tx.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'} MWK {formatAmountWithCommas(tx.amount)}
                  </div>
                  <motion.button
                    onClick={() => tx.id && handleDelete(tx.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 size={18} className="text-red-600"/>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default TransactionLogging;
