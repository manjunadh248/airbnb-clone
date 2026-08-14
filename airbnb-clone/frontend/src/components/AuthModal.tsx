'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      await login(inputValue);
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (email: string) => {
    setIsLoading(true);
    try {
      await login(email);
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      alert("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
      <div 
        className="bg-white w-full max-w-[568px] rounded-xl shadow-2xl flex flex-col max-h-[100vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>
          <h2 className="text-base font-bold text-gray-800 absolute left-1/2 -translate-x-1/2">
            Log in or sign up
          </h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="p-6">
          <h3 className="text-[22px] font-semibold text-gray-800 mb-6 tracking-tight">
            Welcome to Airbnb
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="border border-gray-400 rounded-lg overflow-hidden group focus-within:border-black focus-within:border-2 focus-within:ring-0 relative">
              <label className="absolute top-2 left-3 text-xs text-gray-500 font-medium z-10 transition-transform origin-left">
                Phone number or email
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="w-full pt-6 pb-2 px-3 outline-none text-base text-gray-800 z-20 relative bg-transparent"
                disabled={isLoading}
              />
            </div>
            
            <p className="text-xs text-gray-800 mt-2">
              We'll call or text you to confirm your number. Standard message and data rates apply. <span className="font-semibold underline cursor-pointer">Privacy Policy</span>
            </p>

            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-full bg-[#E51D53] hover:bg-[#D70466] text-white font-semibold py-3.5 rounded-lg mt-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Continuing...' : 'Continue'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => handleSocialLogin('google@guest.com')} className="flex-1 flex items-center justify-center gap-2 border border-black rounded-lg py-3 hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 48 48" className="w-5 h-5"><title>Google Logo</title><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
            </button>
            <button onClick={() => handleSocialLogin('apple@guest.com')} className="flex-1 flex items-center justify-center gap-2 border border-black rounded-lg py-3 hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><title>Apple Logo</title><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.88 1.76.04 3.12.75 3.99 1.95-3.37 2.06-2.82 6.55.45 7.9-1.04 2.92-2.73 4.14-3.02 4.2zm-4.32-13.8c-.28-1.58.62-3.17 2.03-3.69.4.1.86.37 1.25.75 1.1 1.05 1.71 2.51 1.46 4.04-1.63.14-3.26-.8-4.74-2.1z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
