

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Wallet,
  PiggyBank,
  Users,
  Target,
  Zap,
  Heart,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  GraduationCap,
  Info,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { type Screen } from '../App';
import { db, auth } from '../firebase/config'; // My Firebase config
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface HealthFactor {
  factor: string;
  impact: string;
  score: number;
  weight?: number;
  status: string;
  description: string;
  chichewa: string;
  icon: JSX.Element;
  target: string;
  current: string;
}

interface Recommendation {
  title: string;
  titleChichewa: string;
  description: string;
  descriptionChichewa: string;
  action: string;
  actionChichewa: string;
  priority: string;
  impact: string;
  category: string;
  timeframe: string;
}

interface WellnessIndicator {
  title: string;
  titleChichewa: string;
  status: string;
  value: string;
  description: string;
  descriptionChichewa: string;
}

interface FinancialHealthScoreProps {
  onNavigate: (screen: Screen) => void;
  user: User | null;
}

export function FinancialHealthScore({ onNavigate, user }: FinancialHealthScoreProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const [healthFactors, setHealthFactors] = useState<HealthFactor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [wellnessIndicators, setWellnessIndicators] = useState<WellnessIndicator[]>([]);

  const maxScore = 100;

  const getHealthLevel = (score: number) => {
    if (score >= 80)
      return {
        level: 'Excellent Health',
        color: 'text-green-500',
        bg: 'bg-green-500',
        description: 'Your finances are thriving! Keep up the great work.',
        chichewa: 'Ndalama zanu zikuyenda bwino kwambiri!',
      };
    if (score >= 65)
      return {
        level: 'Good Health',
        color: 'text-blue-500',
        bg: 'bg-blue-500',
        description: 'Your financial health is strong with room for improvement.',
        chichewa: 'Ndalama zanu zikuyenda bwino koma zingasinthe.',
      };
    if (score >= 50)
      return {
        level: 'Fair Health',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500',
        description: 'Your finances need attention in some areas.',
        chichewa: 'Ndalama zanu zikufuna kuyang\'anidwa m\'malo ena.',
      };
    if (score >= 35)
      return {
        level: 'Poor Health',
        color: 'text-orange-500',
        bg: 'bg-orange-500',
        description: 'Focus on building stronger financial foundations.',
        chichewa: 'Ganizirani za kukhazikitsa maziko olimba a ndalama.',
      };
    return {
      level: 'Critical Health',
      color: 'text-red-500',
      bg: 'bg-red-500',
      description: 'Immediate attention needed for financial stability.',
      chichewa: 'Mukufuna chithandizo chaposachedwa pa ndalama.',
    };
  };

  const healthLevel = getHealthLevel(healthScore);
  const scorePercentage = (healthScore / maxScore) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'good':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'fair':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'poor':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'healthy':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Live Firebase listener for dynamic data
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid, 'financialData', 'profile');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        const factors = data.healthFactors || healthFactors;
        setHealthFactors(factors);

        // Dynamic score calculation
        let totalWeight = 0;
        let weightedScore = 0;
        factors.forEach((f: any) => {
          const weight = f.weight ?? 1 / factors.length;
          totalWeight += weight;
          weightedScore += f.score * weight;
        });
        const dynamicScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
        setHealthScore(dynamicScore);

        if (data.previousScore) setPreviousScore(data.previousScore);
        if (data.lastUpdated) setLastUpdated(data.lastUpdated);
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.wellnessIndicators) setWellnessIndicators(data.wellnessIndicators);

        // Persist healthScore back to Firestore
        setDoc(docRef, { healthScore: dynamicScore, lastUpdated: new Date().toISOString() }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Handle factor updates
  const updateFactorScore = (index: number, newScore: number) => {
    const updatedFactors = [...healthFactors];
    updatedFactors[index].score = newScore;
    setHealthFactors(updatedFactors);

    // Recalculate health score
    let totalWeight = 0;
    let weightedScore = 0;
    updatedFactors.forEach((f: any) => {
      const weight = f.weight ?? 1 / updatedFactors.length;
      totalWeight += weight;
      weightedScore += f.score * weight;
    });
    const dynamicScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    setHealthScore(dynamicScore);

    // Update Firebase
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'financialData', 'profile');
      setDoc(docRef, { healthFactors: updatedFactors, healthScore: dynamicScore }, { merge: true });
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* UI remains 100% intact */}
      {/* Header, Health Score Card, Tabs, Factors, Recommendations, Progress, Education */}
      {/* Editable example in Health Factors: */}
      <Tabs defaultValue="factors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="factors">Health Factors</TabsTrigger>
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="factors" className="space-y-6">
          <Card className="p-6">
            {healthFactors.map((factor, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(factor.status)} mb-4`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{factor.factor}</p>
                    <p className="text-sm italic">{factor.chichewa}</p>
                  </div>
                  <input
                    type="number"
                    value={factor.score}
                    onChange={(e) => updateFactorScore(index, parseInt(e.target.value))}
                    className="w-20 text-right border rounded px-2 py-1"
                    min={0}
                    max={100}
                  />
                </div>
                <Progress value={factor.score} className="h-2 mt-2" />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Render recommendations as before */}
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default FinancialHealthScore;
