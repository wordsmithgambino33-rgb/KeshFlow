

// PortfolioPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart,
  BarChart3,
  Plus,
  Eye,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  Sparkles,
  Globe,
  Building,
  Edit2,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { type Screen } from '../App';
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface PortfolioPageProps {
  onNavigate: (screen: Screen) => void;
}

type Stat = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon?: any;
  color?: string;
};

type Investment = {
  id?: string;
  name: string;
  symbol: string;
  type: string;
  value: string;
  invested: string;
  return: string;
  returnAmount: string;
  allocation: number;
  trend: 'up' | 'down' | 'neutral';
  icon?: string;
  userId?: string;
  createdAt?: any;
};

type Recommendation = {
  id?: string;
  type: string;
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
};

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [loading, setLoading] = useState(true);

  const [portfolioStats, setPortfolioStats] = useState<Stat[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Modal / form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Investment>>({
    name: '',
    symbol: '',
    type: '',
    value: '',
    invested: '',
    return: '',
    returnAmount: '',
    allocation: 0,
    trend: 'up',
    icon: '📈'
  });

  // Filter/search
  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  // Optional: subscribe to auth to get userId for per-user filtering
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    try {
      const auth = getAuth();
      unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) setUserId(user.uid);
        else setUserId(null);
      });
    } catch (err) {
      setUserId(null); // no auth available
    }
    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Real-time listeners
  useEffect(() => {
    setLoading(true);

    // Stats (all)
    const statsCol = collection(db, 'portfolioStats');
    const unsubStats = onSnapshot(statsCol, (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data() } as Stat));
      setPortfolioStats(data);
    }, (err) => {
      console.error('portfolioStats subscription error:', err);
    });

    // Investments (filter by userId if available)
    const investmentsQuery = userId
      ? query(collection(db, 'investments'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
      : query(collection(db, 'investments'), orderBy('createdAt', 'desc'));

    const unsubInvestments = onSnapshot(investmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Investment[];
      setInvestments(data);
    }, (err) => {
      console.error('investments subscription error:', err);
    });

    // Recommendations (all)
    const recCol = collection(db, 'recommendations');
    const unsubRec = onSnapshot(recCol, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Recommendation[];
      setRecommendations(data);
    }, (err) => {
      console.error('recommendations subscription error:', err);
    });

    setLoading(false);

    return () => {
      unsubStats();
      unsubInvestments();
      unsubRec();
    };
  }, [userId]);

  // Filtered investments by search
  const filteredInvestments = useMemo(() => {
    if (!search) return investments;
    const q = search.toLowerCase();
    return investments.filter(inv =>
      (inv.name ?? '').toLowerCase().includes(q) ||
      (inv.symbol ?? '').toLowerCase().includes(q) ||
      (inv.type ?? '').toLowerCase().includes(q)
    );
  }, [investments, search]);

  // Modal open / edit flows
  const openAdd = () => {
    setIsEditingId(null);
    setForm({
      name: '',
      symbol: '',
      type: '',
      value: '',
      invested: '',
      return: '',
      returnAmount: '',
      allocation: 0,
      trend: 'up',
      icon: '📈'
    });
    setIsAddOpen(true);
  };

  const openEdit = (inv: Investment) => {
    setIsEditingId(inv.id ?? null);
    setForm({
      name: inv.name,
      symbol: inv.symbol,
      type: inv.type,
      value: inv.value,
      invested: inv.invested,
      return: inv.return,
      returnAmount: inv.returnAmount,
      allocation: inv.allocation,
      trend: inv.trend,
      icon: inv.icon
    });
    setIsAddOpen(true);
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setIsEditingId(null);
  };

  const handleFormChange = (field: keyof Investment, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Add / Update
  const handleSubmit = async () => {
    if (!form.name || !form.symbol || !form.type) {
      alert('Please provide at least Name, Symbol and Type.');
      return;
    }

    try {
      if (isEditingId) {
        const ref = doc(db, 'investments', isEditingId);
        await updateDoc(ref, {
          name: form.name,
          symbol: form.symbol,
          type: form.type,
          value: form.value,
          invested: form.invested,
          return: form.return,
          returnAmount: form.returnAmount,
          allocation: Number(form.allocation ?? 0),
          trend: form.trend,
          icon: form.icon,
          updatedAt: serverTimestamp()
        } as any);
        alert('Investment updated.');
      } else {
        const payload: any = {
          name: form.name,
          symbol: form.symbol,
          type: form.type,
          value: form.value,
          invested: form.invested,
          return: form.return,
          returnAmount: form.returnAmount,
          allocation: Number(form.allocation ?? 0),
          trend: form.trend,
          icon: form.icon,
          createdAt: serverTimestamp()
        };
        if (userId) payload.userId = userId;
        await addDoc(collection(db, 'investments'), payload);
        alert('Investment added.');
      }
      closeModal();
    } catch (err) {
      console.error('Error saving investment:', err);
      alert('Error saving investment. Check console.');
    }
  };

  // Delete
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const ok = confirm('Delete this investment? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'investments', id));
      alert('Investment deleted.');
    } catch (err) {
      console.error('Error deleting investment:', err);
      alert('Error deleting investment. Check console.');
    }
  };

  // Export CSV
  const handleExport = () => {
    const rows = [
      ['Name', 'Symbol', 'Type', 'Value', 'Invested', 'Return', 'ReturnAmount', 'Allocation']
    ];
    investments.forEach(inv => {
      rows.push([
        inv.name,
        inv.symbol,
        inv.type,
        inv.value,
        inv.invested,
        inv.return,
        inv.returnAmount,
        String(inv.allocation)
      ]);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investments_export_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Investment Portfolio
            </h1>
            <p className="text-muted-foreground">Track and manage your investment portfolio</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilter(s => !s)}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>
        </div>

        {/* Optional Filter */}
        {showFilter && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 bg-background"
                placeholder="Search investments by name, symbol or type..."
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button variant="ghost" onClick={() => { setSearch(''); setShowFilter(false); }}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <p>Loading portfolio stats...</p>
          ) : (
            portfolioStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform ${stat.color ?? ''}`}>
                      {stat.icon ?? <DollarSign className="w-5 h-5" />}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                       stat.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Portfolio Chart & Performance */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Portfolio Performance</h2>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        selectedPeriod === period
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted-foreground/10'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Portfolio Performance Chart</p>
                  <p className="text-sm text-muted-foreground">Interactive chart showing portfolio growth over time</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-500">+18.2%</p>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-500">12.4%</p>
                  <p className="text-sm text-muted-foreground">Annualized</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-500">0.85</p>
                  <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Asset Allocation
              </h3>
              
              <div className="space-y-4">
                {loading ? (
                  <p>Loading investments...</p>
                ) : (
                  filteredInvestments.map((investment) => (
                    <div key={investment.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{investment.icon ?? '📈'}</span>
                          <span className="text-sm font-medium">{investment.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{investment.allocation}%</span>
                      </div>
                      <Progress value={investment.allocation} className="h-2" />
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target vs Actual
                </h4>
                <div className="text-sm text-muted-foreground">
                  <p>• Stocks: 60% (Current: 68%)</p>
                  <p>• Bonds: 30% (Current: 25%)</p>
                  <p>• Real Estate: 10% (Current: 7%)</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Investment Holdings</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onNavigate?.('holdings' as Screen)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {loading ? <p>Loading investments...</p> : filteredInvestments.map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-border"
                  >
                    <div className="text-3xl flex-shrink-0">{investment.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium line-clamp-1">{investment.name}</h3>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {investment.symbol}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{investment.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[80px]">
                      <p className="font-semibold">{investment.value}</p>
                      <p className="text-sm text-muted-foreground">of {investment.invested}</p>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[80px]">
                      <p className={`font-semibold ${investment.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {investment.return}
                      </p>
                      <p className={`text-sm ${investment.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {investment.returnAmount}
                      </p>
                    </div>
                    <div className="w-16 flex-shrink-0">
                      <Progress value={investment.allocation} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{investment.allocation}%</p>
                    </div>

                    {/* Inline actions */}
                    <div className="flex flex-col gap-2 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(investment)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(investment.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">AI Investment Recommendations</h2>
              </div>
              
              <div className="space-y-4">
                {loading ? <p>Loading recommendations...</p> : recommendations.map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id ?? index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={recommendation.priority === 'high' ? 'destructive' : 
                                  recommendation.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{recommendation.title}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        {recommendation.action}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Geographic Diversification
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Malawi</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">East Africa</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">International</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Sector Allocation
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Financial Services</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Agriculture</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Real Estate</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Technology</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chichewa Tips */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Investment Tip / Malangizo a Mabizinesi
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>English:</strong> Diversify your investments across different sectors and asset classes to reduce risk.<br />
            <strong>Chichewa:</strong> Gawani ndalama zanu m'mabizinesi osiyanasiyana kuti muchepetse chiwopsezo.
          </p>
        </Card>
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <Card className="z-50 w-full max-w-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{isEditingId ? 'Edit Investment' : 'Add Investment'}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeModal}><X className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.name || ''} onChange={e => handleFormChange('name', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Symbol</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.symbol || ''} onChange={e => handleFormChange('symbol', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.type || ''} onChange={e => handleFormChange('type', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Icon (emoji)</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.icon || ''} onChange={e => handleFormChange('icon', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Value</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.value || ''} onChange={e => handleFormChange('value', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Invested</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.invested || ''} onChange={e => handleFormChange('invested', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Return</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.return || ''} onChange={e => handleFormChange('return', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Return Amount</label>
                <input className="w-full rounded border border-border px-3 py-2" value={form.returnAmount || ''} onChange={e => handleFormChange('returnAmount', e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Allocation (%)</label>
                <input type="number" min={0} max={100} className="w-full rounded border border-border px-3 py-2" value={String(form.allocation ?? 0)} onChange={e => handleFormChange('allocation', Number(e.target.value))} />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Trend</label>
                <select className="w-full rounded border border-border px-3 py-2" value={form.trend || 'up'} onChange={e => handleFormChange('trend', e.target.value as any)}>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditingId ? 'Save Changes' : 'Add Investment'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
