

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail, 
  Book,
  Search,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/Input";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase/config"; //  path matches  setup
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import type { Screen } from "../App";

interface SupportCenterProps {
  onNavigate: (screen: Screen) => void;
}

export function SupportCenter({ onNavigate }: SupportCenterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const faqs = [
    {
      question: "How do I connect my bank account?",
      answer:
        "You can connect your bank account through the settings menu by selecting 'Link Bank Account' and following the secure verification process.",
    },
    {
      question: "Is my financial data secure?",
      answer:
        "Yes, we use bank-level encryption and security measures to protect your data. We never store your banking credentials.",
    },
    {
      question: "How do I set up a budget?",
      answer:
        "Go to the Budget section and click 'Create New Budget'. Set your income and categorize your expenses to get started.",
    },
    {
      question: "Can I use KeshFlow offline?",
      answer:
        "Some features work offline, but you'll need an internet connection to sync your data and access real-time information.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // ✅ Load live chat messages
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "supportChats"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatMessages(msgs);
    });
    return () => unsub();
  }, [user]);

  // ✅ Send new message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, "supportChats"), {
        userId: user?.uid || "guest",
        message,
        timestamp: new Date(),
      });
      setMessage("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-poppins font-bold flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            Help & Support Center
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get help with KeshFlow features, find answers to common questions, and contact our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, or FAQs..."
              className="pl-12 h-12 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Help Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">Chat with our support team</p>
              <Button size="sm" className="w-full" onClick={() => onNavigate("Chat")}>
                Start Chat
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
              <Phone className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Call us for immediate help</p>
              <Button variant="outline" size="sm" className="w-full">
                +265 1 234 567
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
              <Mail className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Send us a detailed message</p>
              <Button variant="outline" size="sm" className="w-full">
                Send Email
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
              <Book className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">Comprehensive app guide</p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-primary">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Chat Interface */}
        {user && (
          <Card className="p-6 mt-8">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Live Support Chat
            </h3>
            <div className="h-64 overflow-y-auto border p-3 rounded-md bg-muted/10 mb-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded-md ${
                    msg.userId === user.uid
                      ? "bg-blue-100 text-blue-900 ml-auto w-fit"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.message}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="p-8 text-center bg-muted/30">
          <h3 className="font-semibold mb-4">Still Need Help?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our support team is available Monday to Friday, 8 AM to 6 PM (Malawi time)
            to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Live Chat
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
          </div>
        </Card>

        {/* Chichewa Tips */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
          <h3 className="font-semibold mb-2">🆘 Support Tip / Malangizo a Chithandizo</h3>
          <p className="text-sm text-muted-foreground">
            <strong>English:</strong> When contacting support, include specific details about your issue to get faster and more accurate help.
            <br />
            <strong>Chichewa:</strong> Mukafuna chithandizo, perekani zambiri za vuto lanu kuti mupeze chithandizo chankhani ndi cholondola.
          </p>
        </Card>
      </div>
    </div>
  );
}


export default SupportCenter;
