
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  // ✅ Add Firestore user doc on email signup
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });

      // Create user doc in Firestore if it doesn't exist
      const userRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { email: formData.email, name: formData.name, createdAt: new Date() });
      }

      Toast.show({ type: 'success', text1: 'Account created successfully' });
      onSignUpComplete();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Create Firestore user doc if it doesn't exist
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { email: result.user.email, name: result.user.displayName, createdAt: new Date() });
      }

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
          callback: () => console.log('reCAPTCHA verified')
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

      // Add phone number to Firestore user doc
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, { phone: user.phoneNumber, createdAt: new Date() });
        }
      }

      onSignUpComplete();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Invalid OTP. Please try again.' });
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

  return (
    <div>
      {/* Keep all your existing UI JSX */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default SignUpAuth;
