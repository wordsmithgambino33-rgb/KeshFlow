import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, Star, Filter, Search, Heart, ShoppingCart, CreditCard, Shield, Truck, Clock, Users, TrendingUp, Award, Zap, Building, Phone, Car, Home, Briefcase, GraduationCap
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { db } from '../firebase/config'; // Firebase is initialized
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';
import { toast } from '../lib/toast';
import '../lib/toast.css';
import { type Screen } from '../App';

interface MarketplaceProps {
  onNavigate: (screen: Screen) => void;
}

export function Marketplace({ onNavigate }: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [viewingApplication, setViewingApplication] = useState<any | null>(null);

  const userEmail = "user@example.com"; // Replace with authenticated user email

  // Categories
  const categories = [
    { id: 'all', name: 'All Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'banking', name: 'Banking', icon: <Building className="w-4 h-4" /> },
    { id: 'insurance', name: 'Insurance', icon: <Shield className="w-4 h-4" /> },
    { id: 'investments', name: 'Investments', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'loans', name: 'Loans', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile Money', icon: <Phone className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="w-4 h-4" /> }
  ];

  // Products
  const featuredProducts = [
    {
      id: 1,
      name: "Standard Bank Easy Account",
      provider: "Standard Bank Malawi",
      description: "No minimum balance required. Perfect for everyday banking needs.",
      price: "Free",
      originalPrice: null,
      category: "banking",
      rating: 4.5,
      reviews: 1250,
      features: ["No monthly fees", "Mobile banking", "Debit card included", "ATM access"],
      image: "🏦",
      badge: "Popular",
      promotion: null
    },
    {
      id: 2,
      name: "TNM Mpamba Mobile Wallet",
      provider: "TNM",
      description: "Send money, pay bills, and shop online with ease.",
      price: "MWK 500",
      originalPrice: null,
      category: "mobile",
      rating: 4.7,
      reviews: 2100,
      features: ["Instant transfers", "Bill payments", "Merchant payments", "Cash out"],
      image: "📱",
      badge: "Recommended",
      promotion: "50% off first 3 months"
    },
    {
      id: 3,
      name: "NICO Life Cover",
      provider: "NICO General",
      description: "Comprehensive life insurance with flexible payment options.",
      price: "From MWK 5,000/month",
      originalPrice: "MWK 8,000/month",
      category: "insurance",
      rating: 4.3,
      reviews: 780,
      features: ["Family coverage", "Medical benefits", "Flexible premiums", "Quick claims"],
      image: "🛡️",
      badge: "Limited Time",
      promotion: "Save 37% with annual payment"
    },
    {
      id: 4,
      name: "CDH Investment Fund",
      provider: "CDH Financial Services",
      description: "Diversified investment portfolio managed by professionals.",
      price: "Min. MWK 50,000",
      originalPrice: null,
      category: "investments",
      rating: 4.6,
      reviews: 450,
      features: ["Professional management", "Quarterly reports", "Dividend payments", "Low fees"],
      image: "📈",
      badge: "New",
      promotion: null
    },
    {
      id: 5,
      name: "SME Business Loan",
      provider: "First Capital Bank",
      description: "Quick approval loans for small and medium enterprises.",
      price: "From 15% APR",
      originalPrice: "18% APR",
      category: "loans",
      rating: 4.2,
      reviews: 320,
      features: ["Quick approval", "Flexible terms", "Business support", "Low interest"],
      image: "💼",
      badge: "Featured",
      promotion: "3% off for first-time borrowers"
    },
    {
      id: 6,
      name: "Airtel Money Savings",
      provider: "Airtel Malawi",
      description: "Earn interest on your mobile money savings.",
      price: "5.5% p.a.",
      originalPrice: null,
      category: "mobile",
      rating: 4.4,
      reviews: 1680,
      features: ["Daily interest", "No lock-in period", "Mobile access", "Instant withdrawals"],
      image: "💰",
      badge: "High Yield",
      promotion: "Extra 1% for 3 months"
    }
  ];

  const topProviders = [
    { name: "Standard Bank Malawi", products: 12, rating: 4.5, customers: "50K+", logo: "🏛️" },
    { name: "TNM", products: 8, rating: 4.6, customers: "1M+", logo: "📡" },
    { name: "NICO General", products: 15, rating: 4.4, customers: "25K+", logo: "🛡️" },
    { name: "First Capital Bank", products: 10, rating: 4.3, customers: "30K+", logo: "🏦" }
  ];

  const filteredProducts = featuredProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fetch live user applications
  useEffect(() => {
    const unsubApplications = onSnapshot(
      collection(db, "applications"),
      (snapshot) => {
        const apps = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(app => app.userEmail === userEmail);
        setApplications(apps);
      }
    );

    return () => unsubApplications();
  }, []);

  // Handle "Apply Now"
  const handleApply = async (product: any) => {
    const alreadyApplied = applications.some(app => app.productId === product.id);
    if (alreadyApplied) {
      toast.info("You have already applied for this product.");
      return;
    }
    try {
      await addDoc(collection(db, "applications"), {
        userEmail,
        productId: product.id,
        productName: product.name,
        status: "Pending",
        appliedAt: serverTimestamp()
      });
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application.");
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              Financial Marketplace
            </h1>
            <p className="text-muted-foreground">Discover and compare financial products and services</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList>
                <TabsTrigger value="products">All Products</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="deals">Special Deals</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="applications">My Applications</TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-3xl flex-shrink-0">{product.image}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {product.badge && (
                                  <Badge 
                                    variant={product.badge === 'Popular' ? 'default' : 
                                            product.badge === 'Recommended' ? 'secondary' :
                                            product.badge === 'New' ? 'outline' : 'destructive'}
                                    className="text-xs flex-shrink-0"
                                  >
                                    {product.badge}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{product.provider}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {product.description}
                        </p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-primary">{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  {product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{product.rating}</span>
                              <span className="text-muted-foreground">({product.reviews})</span>
                            </div>
                          </div>

                          {product.promotion && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                              <p className="text-sm text-green-600 font-medium">
                                🎉 {product.promotion}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          {product.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {feature}
                            </div>
                          ))}
                          {product.features.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{product.features.length - 3} more features
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" size="sm" onClick={() => handleApply(product)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Apply Now
                          </Button>
                          <Button variant="outline" size="sm">
                            Compare
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="space-y-6">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You have not applied for any products yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-1 gap-4">
                    {applications.map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-lg transition-all duration-300 flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{app.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Status: <span className={app.status === "Pending" ? "text-orange-500" : "text-green-500"}>{app.status}</span>
                            </p>
                            {app.appliedAt?.seconds && (
                              <p className="text-xs text-muted-foreground">
                                Applied on: {new Date(app.appliedAt.seconds * 1000).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setViewingApplication(app)}>
                            View
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>

          {/* Sidebar (keep as your original code) */}
          <div className="space-y-6">
            {/* Top Providers */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Top Providers
              </h3>
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="text-2xl flex-shrink-0">{provider.logo}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{provider.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{provider.products} products</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {provider.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium">{provider.customers}</p>
                      <p className="text-xs text-muted-foreground">customers</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {/* You can keep your existing Recent Comparisons, Help & Support, and Special Offer cards here */}
          </div>
        </div>

        {/* Viewing Application Modal */}
        {viewingApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-96 space-y-4">
              <h3 className="font-semibold text-lg">{viewingApplication.productName}</h3>
              <p className="text-sm text-muted-foreground">
                Status: <span className={viewingApplication.status === "Pending" ? "text-orange-500" : "text-green-500"}>{viewingApplication.status}</span>
              </p>
              {viewingApplication.appliedAt?.seconds && (
                <p className="text-sm text-muted-foreground">
                  Applied on: {new Date(viewingApplication.appliedAt.seconds * 1000).toLocaleDateString()}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingApplication(null)}>Close</Button>
                {viewingApplication.status === "Pending" && (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deleteDoc(doc(db, "applications", viewingApplication.id));
                      setViewingApplication(null);
                      toast.success("Application cancelled");
                    }}
                  >
                    Cancel Application
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}


export default Marketplace;
