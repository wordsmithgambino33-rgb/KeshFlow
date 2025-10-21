
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  Phone,
  Mail,
  Eye,
  EyeOff,
  User,
  Lock,
  Chrome,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/config'; // use exported auth instance
import Toast from 'react-native-toast-message';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | any;
  }
}

interface SignUpAuthProps {
  onBack: () => void;
  onSignUpComplete: () => void;
}

export function SignUpAuth({ onBack, onSignUpComplete }: SignUpAuthProps) {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (authMethod === 'phone') {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^(\+265)?[1-9]\d{7,8}$/.test(formData.phone.replace(/\s+/g, '')))
        newErrors.phone = 'Please enter a valid Malawian phone number';
    }
    if (authMethod === 'email') {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      Toast.show({ type: 'success', text1: 'Signed in with Google' });
      onSignUpComplete();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA verified'),
        });
      }
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
      setConfirmationResult(result);
      Toast.show({ type: 'info', text1: 'OTP sent to your phone' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!confirmationResult || !otp.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter the OTP code' });
      return;
    }
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      Toast.show({ type: 'success', text1: 'Phone verified successfully' });
      onSignUpComplete();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Invalid OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      Toast.show({ type: 'success', text1: 'Account created successfully' });
      onSignUpComplete();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMethod === 'phone') return handlePhoneSignUp(e);
    if (authMethod === 'email') return handleEmailSignUp(e);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ⬇️ Keep your full UI intact (no changes below)
  // ...
  // (keep your entire existing UI JSX as-is — no modifications to the layout)
  // Just make sure to add this element near your phone form section:
  // <div id="recaptcha-container"></div>

  // Minimal placeholder return so this module compiles.
  // Replace with your full existing JSX (ensure a <div id="recaptcha-container" /> is present near phone form).
  return (
    <div>
      {/* SignUp UI omitted for brevity. Ensure you include: <div id="recaptcha-container"></div> */}
    </div>
  );
}


export default SignUpAuth;
