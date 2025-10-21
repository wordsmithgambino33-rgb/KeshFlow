

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Plus,
  Target,
  GraduationCap,
  Car,
  Home,
  Plane,
  TrendingUp,
  Check,
  Edit3
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  icon: string;
  color: string;
  deadline: string;
  weeklyTarget: number;
  category: string;
  createdAt?: Timestamp;
}

interface GoalsSavingProps {
  onBack: () => void;
}

const ICONS_MAP: { [key: string]: any } = {
  Target,
  GraduationCap,
  Car,
  Home,
  Plane,
};

export function GoalsSaving({ onBack }: GoalsSavingProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    deadline: '',
    icon: 'Target',
    color: '#10B981',
  });
  const [loading, setLoading] = useState(true);

  const goalsCollection = collection(db, 'goals');

  useEffect(() => {
    const q = query(goalsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals: Goal[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          name: data.name,
          target: data.target,
          saved: data.saved || 0,
          icon: data.icon || 'Target',
          color: data.color || '#10B981',
          deadline: data.deadline,
          weeklyTarget: data.weeklyTarget || 0,
          category: data.category || 'General',
          createdAt: data.createdAt,
        };
      });
      setGoals(fetchedGoals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalSavings = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTargets = goals.reduce((sum, goal) => sum + goal.target, 0);

  const getWeeksRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffWeeks);
  };

  const openAddModal = () => {
    setEditingGoalId(null);
    setGoalForm({
      name: '',
      target: '',
      deadline: '',
      icon: 'Target',
      color: '#10B981',
    });
    setShowModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      name: goal.name,
      target: goal.target.toString(),
      deadline: goal.deadline,
      icon: goal.icon,
      color: goal.color,
    });
    setShowModal(true);
  };

  const handleSaveGoal = async () => {
    const { name, target, deadline, icon, color } = goalForm;
    if (!name || !target || !deadline || !icon || !color) return;

    try {
      if (editingGoalId) {
        const goalDoc = doc(db, 'goals', editingGoalId);
        await updateDoc(goalDoc, {
          name,
          target: parseFloat(target),
          deadline,
          icon,
          color,
          weeklyTarget: Math.ceil(parseFloat(target) / getWeeksRemaining(deadline)),
        });
      } else {
        await addDoc(goalsCollection, {
          name,
          target: parseFloat(target),
          saved: 0,
          deadline,
          weeklyTarget: Math.ceil(parseFloat(target) / getWeeksRemaining(deadline)),
          category: 'General',
          color,
          icon,
          createdAt: Timestamp.now(),
        });
      }
      setShowModal(false);
      setEditingGoalId(null);
      setGoalForm({
        name: '',
        target: '',
        deadline: '',
        icon: 'Target',
        color: '#10B981',
      });
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#00796B' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-gray-700">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 pt-12 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={onBack} className="text-white mr-4">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl font-semibold">Goals & Saving</h1>
          </div>
          <button
            onClick={openAddModal}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Plus className="text-white" size={20} />
          </button>
        </div>

        {/* Overall Progress */}
        <Card className="bg-white/10 backdrop-blur-sm border-0 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-white/70 text-sm">Total Saved</p>
              <h2 className="text-white text-2xl font-semibold">MWK {totalSavings.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Total Goals</p>
              <h2 className="text-white text-2xl font-semibold">MWK {totalTargets.toLocaleString()}</h2>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round((totalSavings / totalTargets) * 100)}%</span>
            </div>
            <Progress 
              value={(totalSavings / totalTargets) * 100} 
              className="h-2 bg-white/20"
            />
          </div>
          
          <p className="text-white/70 text-sm">
            {goals.filter(goal => (goal.saved / goal.target) >= 1).length} of {goals.length} goals completed
          </p>
        </Card>
      </div>

      <div className="p-6 space-y-6">
        {/* Goals Grid */}
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const Icon = ICONS_MAP[goal.icon] || Target;
            const percentage = (goal.saved / goal.target) * 100;
            const weeksRemaining = getWeeksRemaining(goal.deadline);
            const isCompleted = percentage >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${goal.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-700 mb-1">{goal.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                        </div>

                        <div className="flex flex-col items-center space-y-1">
                          <CircularProgress 
                            percentage={Math.min(percentage, 100)} 
                            size={60}
                            color={isCompleted ? '#10B981' : '#00796B'}
                          />
                          <div className="flex space-x-1 mt-1">
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <Check className="text-white" size={12} />
                              </motion.div>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditModal(goal)}
                              className="w-6 h-6 p-0"
                            >
                              <Edit3 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>MWK {goal.saved.toLocaleString()}</span>
                          <span>MWK {goal.target.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Remaining</p>
                          <p className="text-sm font-medium text-gray-700">
                            MWK {Math.max(0, goal.target - goal.saved).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Deadline</p>
                          <p className={`text-sm font-medium ${weeksRemaining <= 4 ? 'text-red-500' : 'text-gray-700'}`}>
                            {weeksRemaining > 0 ? `${weeksRemaining} weeks` : 'Overdue'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Weekly Target</p>
                          <p className="text-sm font-medium text-teal-600">
                            MWK {goal.weeklyTarget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-6 rounded-2xl shadow-lg bg-gradient-to-r from-green-100 to-teal-100">
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={openAddModal}
              variant="outline"
              className="h-12 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <Plus size={18} className="mr-2" />
              Add Goal
            </Button>
            <Button
              variant="outline"
              className="h-12 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white"
            >
              <TrendingUp size={18} className="mr-2" />
              View Tips
            </Button>
          </div>
        </Card>
      </div>

      {/* Add/Edit Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-6">
                {editingGoalId ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                  <Input
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    placeholder="e.g., New Phone"
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (MWK)</label>
                  <Input
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                    placeholder="e.g., 250000"
                    type="number"
                    className="h-12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                  <Input
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    type="date"
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={goalForm.icon}
                    onChange={(e) => setGoalForm({ ...goalForm, icon: e.target.value })}
                    className="h-12 w-full rounded-md border px-3"
                  >
                    {Object.keys(ICONS_MAP).map((iconName) => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="color"
                    value={goalForm.color}
                    onChange={(e) => setGoalForm({ ...goalForm, color: e.target.value })}
                    className="w-full h-12 p-1 rounded-md border"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button onClick={() => setShowModal(false)} variant="outline" className="flex-1 h-12">
                  Cancel
                </Button>
                <Button onClick={handleSaveGoal} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  {editingGoalId ? 'Save Changes' : 'Add Goal'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default ICONS_MAP;


export { ICONS_MAP };
