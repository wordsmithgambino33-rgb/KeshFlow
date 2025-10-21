

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, MessageCircle, TrendingUp, Award, Send } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { type Screen } from "../App";

interface CommunityProps {
  onNavigate: (screen: Screen) => void;
  user?: { uid: string; email?: string | null; displayName?: string | null };
}

interface Post {
  id: string;
  message: string;
  author: string;
  createdAt: string;
}

export function Community({ onNavigate, user }: CommunityProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Real-time listener for community posts
  useEffect(() => {
    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const livePosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        message: doc.data().message,
        author: doc.data().author || "Anonymous",
        createdAt: new Date(doc.data().createdAt?.seconds * 1000).toLocaleString(),
      }));
      setPosts(livePosts);
    });
    return () => unsubscribe();
  }, []);

  // 📝 Post submission logic
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "community_posts"), {
        message: newPost,
        author: user?.displayName || user?.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewPost("");
    } catch (error) {
      console.error("Error posting message:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📧 Save "notify me" users for launch updates
  const handleNotify = async () => {
    if (!email.trim()) return alert("Please enter your email.");
    try {
      await addDoc(collection(db, "launch_notifications"), {
        email,
        createdAt: serverTimestamp(),
      });
      alert("✅ You’ll be notified when the community launches!");
      setEmail("");
    } catch (err) {
      console.error("Error saving notification:", err);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Financial Community
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow Malawians on their financial journey. Share tips, ask questions, and learn together.
          </p>
        </div>

        {/* Post Input Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" /> Share Your Thought
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share a budgeting tip, or financial insight..."
              className="flex-1"
            />
            <Button onClick={handlePostSubmit} disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </Card>

        {/* Live Community Posts */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="p-4 border border-primary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-primary">{post.author}</span>
                  <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                </div>
                <p className="text-sm">{post.message}</p>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">No posts yet. Be the first to share something! 💬</p>
          )}
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="mb-8">
            <Users className="w-24 h-24 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Community Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're building an amazing community space where Malawians can share financial wisdom,
              celebrate achievements, and support each other's financial goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="p-6">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Discussion Forums</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions and share advice on budgeting, investing, and financial planning
              </p>
            </Card>

            <Card className="p-6">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Success Stories</h3>
              <p className="text-sm text-muted-foreground">
                Celebrate financial milestones and inspire others with your achievements
              </p>
            </Card>

            <Card className="p-6">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Challenges & Goals</h3>
              <p className="text-sm text-muted-foreground">
                Join community challenges and achieve your financial goals together
              </p>
            </Card>
          </div>

          <div className="flex justify-center gap-3 items-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter email to get notified"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleNotify}>
              <Send className="w-4 h-4 mr-2" /> Notify Me
            </Button>
          </div>
        </motion.div>

        {/* Community Tip */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <h3 className="font-semibold mb-2">🤝 Community Tip / Malangizo a Gulu</h3>
          <p className="text-sm text-muted-foreground">
            <strong>English:</strong> Learning from others' financial experiences can help you avoid mistakes and find new opportunities.<br />
            <strong>Chichewa:</strong> Kuphunzira kuchokera ku zokumana nazo za ena za ndalama kungakuthandizeni kupewa zolakwika ndi kupeza mwayi watsopano.
          </p>
        </Card>
      </div>
    </div>
  );
}


export default Community;
