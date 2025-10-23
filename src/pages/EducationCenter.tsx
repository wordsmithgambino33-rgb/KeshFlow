

// EducationCenter.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Play,
  Clock,
  Star,
  Trophy,
  Target,
  Users,
  Bookmark,
  Search,
  Filter,
  ChevronRight,
  Award,
  TrendingUp,
  PieChart,
  DollarSign,
  Shield,
  Lightbulb,
  Download
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import  Input  from '../ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { type Screen } from '../App';

// Firebase imports - your firebase/config.ts must export db, auth, storage
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  addDoc,
  setDoc,
  serverTimestamp,
  orderBy,
  where,
  updateDoc
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase/config';

interface EducationCenterProps {
  onNavigate: (screen: Screen) => void;
}

type Course = {
  id: string | number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  rating: number;
  students: number;
  completed?: boolean;
  progress?: number;
  category: string;
  thumbnail: string;
  lessons?: number;
};

// Full syllabus / modules content (used for certificates / admin UI)
export const modulesSyllabus = [
  {
    id: 'assets-liabilities',
    title: 'Understanding Assets & Liabilities',
    summary:
      'Distinguish assets, liabilities and net worth. Build and interpret a simple balance sheet for personal finances.',
    topics: [
      'Definitions: assets, liabilities, equity',
      'Personal vs business balance sheets',
      'Net worth calculation',
      'Examples: cash, savings, loans, mortgages',
      'Practical exercise: build your first personal balance sheet'
    ]
  },
  {
    id: 'budgeting-saving',
    title: 'Budgeting, Saving & Financial Discipline',
    summary: 'Monthly budgets, emergency funds, and savings habits.',
    topics: [
      '50/30/20 rule',
      'Setting savings goals',
      'Emergency funds',
      'Expense tracking'
    ]
  },
  {
    id: 'mse-investing',
    title: 'Investing in Stocks — Malawi Stock Exchange (MSE) Focus',
    summary:
      'Intro to stocks, read listings, dividends, and local examples from the MSE.',
    topics: [
      'What is a stock / share',
      'How the Malawi Stock Exchange works',
      'Local examples: NBM, TNM, Airtel Malawi, Standard Bank Malawi, NICO, Press Corporation',
      'Dividends, capital gains, risks',
      'How to read a stock quote'
    ]
  },
  {
    id: 'credit-debt',
    title: 'Understanding Credit, Loans & Debt Management',
    summary:
      'Interest, APR, loan terms, and responsible borrowing.',
    topics: [
      'Types of loans',
      'Interest calculation',
      'Collateral & credit checks',
      'Strategies to manage/reduce debt'
    ]
  },
  {
    id: 'digital-finance',
    title: 'Digital Banking & Mobile Money',
    summary:
      'Mobile wallets, digital payments, and secure practices.',
    topics: [
      'Mobile money basics (TNM Mpamba, Airtel Money)',
      'Mobile savings & interest',
      'Security best practices',
      'Payments and merchant integration'
    ]
  },
  {
    id: 'small-business',
    title: 'Small Business Finance',
    summary: 'Cash flow, pricing, and basic bookkeeping for SMEs.',
    topics: [
      'Cash flow basics',
      'Pricing & margin',
      'Simple bookkeeping',
      'Business loan basics'
    ]
  }
];

export function EducationCenter({ onNavigate }: EducationCenterProps) {
  // Authenticated user (may be null)
  const currentUser = auth.currentUser;

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  // Local fallback courses (keeps your UI intact if Firestore collection doesn't exist)
  const fallbackCourses: Course[] = [
    {
      id: 1,
      title: 'Budgeting Basics for Malawians',
      description:
        'Learn how to create and stick to a budget that works for the Malawian lifestyle',
      instructor: 'Dr. Grace Mwale',
      duration: '2 hours',
      level: 'Beginner',
      rating: 4.8,
      students: 1250,
      completed: false,
      progress: 0,
      category: 'Budgeting',
      thumbnail:
        'https://images.unsplash.com/photo-1633504214759-e1013f422ed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwd29tYW4lMjBjb3VudGluZyUyMG1vbmV5JTIwYnVkZ2V0aW5nfGVufDF8fHx8MTc1OTcyMDg3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      lessons: 8
    },
    {
      id: 2,
      title: 'Investing in the Malawi Stock Exchange',
      description: 'Complete guide to investing in MSE and building wealth through stocks',
      instructor: 'James Banda',
      duration: '3.5 hours',
      level: 'Intermediate',
      rating: 4.9,
      students: 890,
      completed: false,
      progress: 35,
      category: 'Investing',
      thumbnail: '📈',
      lessons: 12
    },
    {
      id: 3,
      title: 'Small Business Finance',
      description: 'Managing finances for your small business or side hustle',
      instructor: 'Sarah Phiri',
      duration: '2.5 hours',
      level: 'Intermediate',
      rating: 4.7,
      students: 670,
      completed: true,
      progress: 100,
      category: 'Business',
      thumbnail: '🏪',
      lessons: 10
    },
    {
      id: 4,
      title: 'Insurance and Risk Management',
      description: 'Understanding different types of insurance available in Malawi',
      instructor: 'Dr. Patrick Mhango',
      duration: '1.5 hours',
      level: 'Beginner',
      rating: 4.6,
      students: 450,
      completed: false,
      progress: 0,
      category: 'Insurance',
      thumbnail: '🛡️',
      lessons: 6
    },
    {
      id: 5,
      title: 'Retirement Planning in Malawi',
      description: 'How to prepare for retirement with limited resources',
      instructor: 'Mary Chilima',
      duration: '2 hours',
      level: 'Advanced',
      rating: 4.8,
      students: 320,
      completed: false,
      progress: 60,
      category: 'Retirement',
      thumbnail: '🏖️',
      lessons: 8
    },
    {
      id: 6,
      title: 'Digital Banking & Mobile Money',
      description: 'Maximizing the benefits of digital financial services',
      instructor: 'John Kamwendo',
      duration: '1 hour',
      level: 'Beginner',
      rating: 4.9,
      students: 980,
      completed: true,
      progress: 100,
      category: 'Digital Finance',
      thumbnail: '📱',
      lessons: 5
    }
  ];

  // Derived progress summary (keeps your previous UX)
  const userProgress = useMemo(() => {
    const completed = courses.filter((c) => c.completed).length;
    const xp = Math.round(courses.reduce((acc, c) => acc + (c.progress ?? 0), 0) / 10);
    const level = Math.max(1, Math.floor(completed / 2) + 1);
    const nextLevelXp = (level + 1) * 500;
    return {
      level,
      xp,
      nextLevelXp,
      completedCourses: completed,
      certificatesCount: certificates.length,
      streakDays: 15
    };
  }, [courses, certificates]);

  // Load courses from Firestore (if exists) with real-time updates; fallback to static
  useEffect(() => {
    setLoadingCourses(true);
    try {
      const q = query(collection(db, 'courses'), orderBy('title'));
      const unsub = onSnapshot(
        q,
        (snap) => {
          if (snap.empty) {
            setCourses(fallbackCourses);
            setLoadingCourses(false);
            return;
          }
          const rows: Course[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              title: data.title,
              description: data.description,
              instructor: data.instructor,
              duration: data.duration,
              level: data.level,
              rating: data.rating,
              students: data.students,
              completed: data.completed ?? false,
              progress: data.progress ?? 0,
              category: data.category,
              thumbnail: data.thumbnail,
              lessons: data.lessons ?? 0
            };
          });
          setCourses(rows);
          setLoadingCourses(false);
        },
        (err) => {
          console.error('courses onSnapshot error', err);
          setCourses(fallbackCourses);
          setLoadingCourses(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.error('error loading courses', err);
      setCourses(fallbackCourses);
      setLoadingCourses(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user display name (auth or users/{uid})
  useEffect(() => {
    const fetchName = async () => {
      if (!currentUser) {
        setUserName(null);
        return;
      }
      if (currentUser.displayName) {
        setUserName(currentUser.displayName);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as any;
          setUserName(data.fullName || data.name || currentUser.email || 'Learner');
        } else {
          setUserName(currentUser.email || 'Learner');
        }
      } catch (err) {
        console.error('fetch user name error', err);
        setUserName(currentUser.email || 'Learner');
      }
    };
    fetchName();
  }, [currentUser]);

  // Listen to user's certificates (so Download becomes available)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'certificates'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setCertificates(docs);
    }, (err) => {
      console.error('certificates onSnapshot error', err);
    });
    return () => unsub();
  }, [currentUser]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  // Mark course complete + generate certificate PNG -> upload to Storage -> create Firestore doc
  const markCompleteAndCreateCertificate = async (course: Course) => {
    if (!currentUser) {
      alert('Please sign in to receive certificates.');
      return;
    }

    const courseId = String(course.id);
    setGenerating((s) => ({ ...s, [courseId]: true }));

    try {
      // 1) mark user-course subdoc
      const userCourseRef = doc(db, 'users', currentUser.uid, 'courses', courseId);
      await setDoc(userCourseRef, {
        courseId,
        title: course.title,
        completed: true,
        progress: 100,
        completedAt: serverTimestamp()
      }, { merge: true });

      // 2) create certificate image (dataURL)
      const fileDataUrl = await generateCertificatePng({
        learnerName: userName || currentUser.email || 'Learner',
        courseTitle: course.title,
        dateStr: new Date().toLocaleDateString()
      });

      // 3) upload to Storage
      const filePath = `certificates/${currentUser.uid}/${courseId}_${Date.now()}.png`;
      const sRef = storageRef(storage, filePath);
      await uploadString(sRef, fileDataUrl, 'data_url');

      // 4) get download URL
      const downloadUrl = await getDownloadURL(sRef);

      // 5) write certificate doc
      await addDoc(collection(db, 'certificates'), {
        userId: currentUser.uid,
        userName: userName || currentUser.email || 'Learner',
        courseId,
        courseTitle: course.title,
        storagePath: filePath,
        downloadUrl,
        createdAt: serverTimestamp()
      });

      // 6) Update local course state to show completed / progress
      setCourses((prev) => prev.map((c) => (String(c.id) === courseId ? { ...c, completed: true, progress: 100 } : c)));

      // 7) (Optional) call a callable function to email the certificate (if you deployed one)
      try {
        const functions = getFunctions();
        const sendCert = httpsCallable(functions, 'sendCertificateEmail');
        // If function exists, pass required parameters (function may be absent - wrapped in try/catch)
        await sendCert({
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userName: userName,
          courseId,
          courseTitle: course.title,
          downloadUrl
        });
      } catch (err) {
        // Not fatal — function may not exist
        // console.info('sendCertificateEmail function not present or failed', err);
      }

      // Success feedback
      alert('Course marked complete and certificate uploaded to your account (Certificates).');
    } catch (err) {
      console.error('markCompleteAndCreateCertificate error', err);
      alert('Failed to complete course / upload certificate. See console for details.');
    } finally {
      setGenerating((s) => ({ ...s, [courseId]: false }));
    }
  };

  // Regenerate certificate (same process; will upload a new file and add a new certificate doc)
  const regenerateCertificate = async (course: Course) => {
    if (!currentUser) {
      alert('Please sign in.');
      return;
    }
    // Call same flow
    await markCompleteAndCreateCertificate(course);
  };

  // Download certificate file from stored downloadUrl
  const downloadCertificate = (certRecord: any) => {
    if (!certRecord?.downloadUrl) {
      alert('Certificate not ready yet.');
      return;
    }
    const a = document.createElement('a');
    a.href = certRecord.downloadUrl;
    a.download = `${certRecord.courseTitle}_KeshFlow_certificate.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Canvas certificate generator (returns dataURL)
  const generateCertificatePng = async ({
    learnerName,
    courseTitle,
    dateStr
  }: {
    learnerName: string;
    courseTitle: string;
    dateStr: string;
  }) => {
    // High-res canvas for good print quality
    const width = 2480; // A4-ish width at 300dpi is large, but keep manageable
    const height = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Background
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#E6D6B8';
    ctx.lineWidth = 24;
    roundRect(ctx, 40, 40, width - 80, height - 80, 36);
    ctx.stroke();

    // Title area
    ctx.fillStyle = '#0B5B3B'; // KeshFlow deep green
    ctx.font = 'bold 110px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('KeshFlow', width / 2, 240);

    ctx.fillStyle = '#25303A';
    ctx.font = '28px Helvetica, Arial';
    ctx.fillText('Financial Education Program', width / 2, 295);

    // "This certifies that"
    ctx.fillStyle = '#384048';
    ctx.font = '28px Helvetica, Arial';
    ctx.fillText('This certifies that', width / 2, 420);

    // Learner name
    ctx.fillStyle = '#07203E';
    ctx.font = 'bold 72px Georgia';
    ctx.fillText(learnerName, width / 2, 520);

    // Completion text
    ctx.fillStyle = '#394047';
    ctx.font = '26px Helvetica, Arial';
    ctx.fillText('has successfully completed the module', width / 2, 580);

    // Course title (wrap)
    ctx.fillStyle = '#0B5B3B';
    ctx.font = 'bold 44px Georgia';
    wrapText(ctx, courseTitle, width / 2, 680, width - 360, 52);

    // Date and signatures
    ctx.fillStyle = '#374151';
    ctx.font = '22px Helvetica, Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${dateStr}`, 140, height - 260);

    // Signature lines
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width - 980, height - 320);
    ctx.lineTo(width - 240, height - 320);
    ctx.stroke();
    ctx.font = '20px Helvetica, Arial';
    ctx.fillText('Trainer', width - 980, height - 290);

    ctx.beginPath();
    ctx.moveTo(140, height - 320);
    ctx.lineTo(880, height - 320);
    ctx.stroke();
    ctx.fillText('Director of Financial Education', 140, height - 290);

    // watermark
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#07203E';
    ctx.font = 'bold 420px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('⚖', width / 2, height / 2 + 120);
    ctx.globalAlpha = 1;

    // Footer
    ctx.textAlign = 'center';
    ctx.font = '18px Helvetica, Arial';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('KeshFlow • Empowering Financial Wisdom for Africa’s Next Generation', width / 2, height - 80);

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  };

  // Canvas helpers
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    ctx.textAlign = 'center';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + i * lineHeight);
    }
  };

  // UI render
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-poppins font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              Financial Education Center
            </h1>
            <p className="text-muted-foreground">Learn, grow, and master your financial skills</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* User Progress Dashboard */}
        <div className="grid lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Your Level</h3>
                <p className="text-2xl font-bold text-primary">Level {userProgress.level}</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <Progress value={Math.min(100, (userProgress.xp / userProgress.nextLevelXp) * 100 || 0)} className="mb-2" />
            <p className="text-sm text-muted-foreground">{userProgress.xp}/{userProgress.nextLevelXp} XP to next level</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Courses Completed</h3>
                <p className="text-2xl font-bold text-green-500">{userProgress.completedCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">{userProgress.certificatesCount} certificates earned</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Learning Streak</h3>
                <p className="text-2xl font-bold text-orange-500">{userProgress.streakDays} days</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground">Keep it up! 🔥</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Community Rank</h3>
                <p className="text-2xl font-bold text-purple-500">#127</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground">Top 15% of learners</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Courses */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">All Courses</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  {Array.from(new Set(['All', ...courses.map((c) => c.category)])).map((category) => (
                    <Button key={category} variant="outline" size="sm" className="text-xs">{category}</Button>
                  ))}
                </div>

                {/* Course Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {loadingCourses ? (
                    <p>Loading courses...</p>
                  ) : (
                    filteredCourses.map((course, index) => (
                      <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="h-full">
                        <Card className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                          {/* Course Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                              {typeof course.thumbnail === 'string' && course.thumbnail.startsWith('http') ? (
                                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover" />
                              ) : (
                                <div className="text-4xl">{course.thumbnail}</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                                <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'outline'} className="text-xs">{course.level}</Badge>
                              </div>
                              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="space-y-4 flex-1">
                            <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 justify-center"><Clock className="w-4 h-4 flex-shrink-0" /><span className="truncate">{course.duration}</span></div>
                              <div className="flex items-center gap-1 justify-center"><Users className="w-4 h-4 flex-shrink-0" /><span className="truncate">{Number(course.students).toLocaleString()}</span></div>
                              <div className="flex items-center gap-1 justify-center"><Star className="w-4 h-4 flex-shrink-0 fill-yellow-400 text-yellow-400" /><span className="truncate">{course.rating}</span></div>
                            </div>

                            {/* Progress Bar */}
                            {course.progress && course.progress > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                              </div>
                            )}
                          </div>

                          {/* Course Footer */}
                          <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
                            <span className="text-sm text-muted-foreground truncate flex-1 mr-2">by {course.instructor}</span>

                            <div className="flex items-center gap-2">
                              {!course.completed ? (
                                <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground flex-shrink-0" onClick={(e) => { e.stopPropagation(); markCompleteAndCreateCertificate(course); }} disabled={generating[String(course.id)]}>
                                  {generating[String(course.id)] ? 'Generating...' : 'Mark Complete & Certify'}
                                </Button>
                              ) : (
                                <div className="flex gap-2 items-center">
                                  <Button size="sm" onClick={(e) => { e.stopPropagation(); const cert = certificates.find((c) => c.courseId === String(course.id)); if (cert) downloadCertificate(cert); else alert('Certificate not ready yet.'); }}>
                                    <Download className="w-4 h-4 mr-2" />Download Certificate
                                  </Button>

                                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); regenerateCertificate(course); }}>
                                    Regenerate
                                  </Button>
                                </div>
                              )}

                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); /* Course details route / modal */ }}>
                                Continue <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="in-progress">
                <div className="text-center py-12">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Continue Learning</h3>
                  <p className="text-muted-foreground">Your in-progress courses will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Completed Courses</h3>
                  <p className="text-muted-foreground">Courses you've completed will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="bookmarked">
                <div className="text-center py-12">
                  <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Bookmarked Courses</h3>
                  <p className="text-muted-foreground">Save courses for later and find them here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Lessons */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5" />Quick Lessons</h3>
              <div className="space-y-3">
                {[
                  { title: 'Understanding Compound Interest', duration: '5 min', type: 'Video', category: 'Investing' },
                  { title: 'Emergency Fund Calculator', duration: '3 min', type: 'Tool', category: 'Savings' },
                  { title: 'Malawi Tax Basics', duration: '8 min', type: 'Article', category: 'Taxes' },
                  { title: 'Debt Payoff Strategies', duration: '6 min', type: 'Video', category: 'Debt' },
                ].map((lesson, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {lesson.type === 'Video' ? <Play className="w-4 h-4" /> : lesson.type === 'Tool' ? <TrendingUp className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 mb-1">{lesson.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{lesson.duration}</span><span>•</span><span>{lesson.type}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">View All Quick Lessons</Button>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5" />Achievements</h3>
              <div className="space-y-3">
                {[
                  { title: 'First Course Completed', description: 'Completed your first financial literacy course', icon: '🎓', earned: true, date: '2024-09-15' },
                  { title: 'Budget Master', description: 'Successfully maintained a budget for 3 months', icon: '💯', earned: true, date: '2024-09-28' },
                  { title: 'Investment Explorer', description: 'Complete the investing basics course', icon: '🔍', earned: false, date: null },
                  { title: 'Streak Champion', description: 'Study for 30 days in a row', icon: '🔥', earned: false, date: null },
                ].map((achievement, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                    <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm mb-1 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`}>{achievement.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{achievement.description}</p>
                      {achievement.earned && achievement.date && <p className="text-xs text-primary">Earned on {new Date(achievement.date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Reminder */}
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" />Daily Study Goal</h3>
              <p className="text-sm text-muted-foreground mb-4">You've studied for 25 minutes today. Just 5 more minutes to reach your daily goal!</p>
              <Progress value={83} className="mb-4" />
              <Button className="w-full" size="sm">Continue Learning</Button>
            </Card>
          </div>
        </div>

        {/* Chichewa Tips */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <h3 className="font-semibold mb-2">📚 Education Tip / Malangizo a Maphunziro</h3>
          <p className="text-sm text-muted-foreground">
            <strong>English:</strong> Dedicate 15-30 minutes daily to financial education to build long-term wealth.<br />
            <strong>Chichewa:</strong> Patsani mphindi 15-30 tsiku lililonse kuphunzira za ndalama kuti muzipeza chuma chokhalitsa.
          </p>
        </Card>
      </div>
    </div>
  );
}


export default modulesSyllabus;
