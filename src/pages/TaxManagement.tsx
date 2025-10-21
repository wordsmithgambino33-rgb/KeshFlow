

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Calculator, Calendar, Receipt } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { type Screen } from '../App';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

// Example MRA PAYE/Income Tax and Company Tax rates (2025)
const PAYE_RATES = [
  { upper: 50000, rate: 0.15 },
  { upper: 100000, rate: 0.20 },
  { upper: 150000, rate: 0.25 },
  { upper: Infinity, rate: 0.30 },
];
const COMPANY_TAX_RATE = 0.30;

interface TaxManagementProps {
  onNavigate: (screen: Screen) => void;
}

interface TaxLogEntry {
  type: 'salary' | 'company';
  amount: number;
  calculatedTax: number;
  date: string;
  nextDueDate: string;
}

export function TaxManagement({ onNavigate }: TaxManagementProps) {
  const [user, setUser] = useState<any>(null);
  const [salary, setSalary] = useState<number>(0);
  const [companyProfit, setCompanyProfit] = useState<number>(0);
  const [paye, setPaye] = useState<number>(0);
  const [companyTax, setCompanyTax] = useState<number>(0);
  const [reminderDate, setReminderDate] = useState<string>("");
  const [taxHistory, setTaxHistory] = useState<TaxLogEntry[]>([]);
  const [taxReminders, setTaxReminders] = useState<string[]>([]);

  // Track user login and fetch tax history & reminders
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, { taxReminders: [], taxHistory: [] });
        } else {
          const data = docSnap.data();
          setTaxHistory(data?.taxHistory || []);
          setTaxReminders(data?.taxReminders || []);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Notify user of upcoming remittances
  useEffect(() => {
    const today = new Date();
    taxReminders.forEach(dateStr => {
      const remDate = new Date(dateStr);
      const diffDays = Math.ceil((remDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 3) {
        toast.info(`⚠️ Tax remittance due in ${diffDays} day(s): ${dateStr}`);
      }
    });
  }, [taxReminders]);

  const calculatePAYE = (salary: number) => {
    let tax = 0;
    let remaining = salary;
    for (let slab of PAYE_RATES) {
      const taxable = Math.min(remaining, slab.upper);
      tax += taxable * slab.rate;
      remaining -= taxable;
      if (remaining <= 0) break;
    }
    setPaye(tax);
    return tax;
  };

  const calculateCompanyTax = (profit: number) => {
    const tax = profit * COMPANY_TAX_RATE;
    setCompanyTax(tax);
    return tax;
  };

  const getNextDueDate = () => {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    return today.toISOString().split('T')[0];
  };

  const saveTaxEntry = async (type: 'salary' | 'company', amount: number, calculatedTax: number) => {
    if (!user) return toast.error('Please log in to save tax records');

    const nextDue = getNextDueDate();
    const entry: TaxLogEntry = {
      type,
      amount,
      calculatedTax,
      date: new Date().toISOString().split('T')[0],
      nextDueDate: nextDue,
    };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { taxHistory: arrayUnion(entry) });
      setTaxHistory(prev => [...prev, entry]);
      toast.success(`Entry saved! Next due: ${nextDue}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save tax entry');
    }
  };

  const saveReminder = async () => {
    if (!user || !reminderDate) return toast.error('Please log in and select a reminder date');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { taxReminders: arrayUnion(reminderDate) });
      setTaxReminders(prev => [...prev, reminderDate]);
      toast.success(`Reminder set for ${reminderDate} ✅`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reminder 😞');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Tax Management
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simplify your tax planning and filing with tools designed for Malawian tax laws.
          </p>
        </div>

        {/* Tax Tools */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {/* PAYE Calculator */}
            <Card className="p-6">
              <Calculator className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">PAYE Calculator</h3>
              <input type="number" value={salary} onChange={(e) => setSalary(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm mb-2" placeholder="Enter monthly salary (MWK)" />
              <Button size="sm" onClick={() => saveTaxEntry('salary', salary, calculatePAYE(salary))}>Calculate & Save</Button>
              {paye > 0 && <p className="mt-2 text-sm text-muted-foreground">PAYE: MWK {paye.toFixed(2)}</p>}
            </Card>

            {/* Company Tax Calculator */}
            <Card className="p-6">
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Company Tax</h3>
              <input type="number" value={companyProfit} onChange={(e) => setCompanyProfit(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm mb-2" placeholder="Enter company profit (MWK)" />
              <Button size="sm" onClick={() => saveTaxEntry('company', companyProfit, calculateCompanyTax(companyProfit))}>Calculate & Save</Button>
              {companyTax > 0 && <p className="mt-2 text-sm text-muted-foreground">Company Tax: MWK {companyTax.toFixed(2)}</p>}
            </Card>

            {/* Filing Reminder */}
            <Card className="p-6">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Filing Reminder</h3>
              <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm mb-2" />
              <Button size="sm" onClick={saveReminder}>Save Reminder</Button>
            </Card>
          </div>

          <Button size="lg" onClick={() => toast.info('Advanced tax features coming soon!')}>
            Get Notified When Available
          </Button>
        </motion.div>

        {/* Tax History */}
        {taxHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">📜 Tax History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {taxHistory.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center border-b py-2">
                  <div>
                    <p className="text-sm font-medium">
                      {entry.type === 'salary' ? 'Salary' : 'Company Profit'}: MWK {entry.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tax: MWK {entry.calculatedTax.toFixed(2)} | Submitted: {entry.date} | Next Due: {entry.nextDueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Chichewa Tips */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <h3 className="font-semibold mb-2">📋 Tax Tip / Malangizo a Misonkho</h3>
          <p className="text-sm text-muted-foreground">
            <strong>English:</strong> Keep all your receipts and financial records organized to make tax filing easier and claim all eligible deductions.<br />
            <strong>Chichewa:</strong> Sungani ma risiti anu onse ndi zolemba za ndalama bwino kuti kulipira misonkho kukhale kosavuta.
          </p>
        </Card>
      </div>
    </div>
  );
}


export default PAYE_RATES;


export { PAYE_RATES };
