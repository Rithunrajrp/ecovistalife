"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast({ title: "Login Successful", type: "success" });
      // Redirect is handled by layout.tsx onAuthStateChange
    } catch (err: any) {
      toast({ title: "Authentication Failed", description: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-screen z-50">
      {/* Blurred Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000" 
          alt="Premium Real Estate" 
          fill 
          className="object-cover opacity-30 blur-sm scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/90 to-[#0B0F14]/60" />
      </div>

      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.8)] border border-gray-800/50 relative z-10 animate-in fade-in zoom-in-95 duration-700 mt-20 md:mt-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">EcoVista<span className="text-[#D4AF37]">Admin</span></h1>
          <p className="text-gray-400 mt-2 text-sm font-medium">Secure Access Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecovistalife.in"
                className="w-full bg-[#0B0F14] border border-gray-800 text-white pl-11 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder:text-gray-600 h-12 rounded-xl transition-all shadow-inner"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F14] border border-gray-800 text-white pl-11 pr-11 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder:text-gray-600 h-12 rounded-xl transition-all shadow-inner"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-800 bg-[#0B0F14] text-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:ring-offset-0 focus:border-[#D4AF37] transition-all cursor-pointer" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Remember session</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full text-lg shadow-[0_4px_14px_rgba(212,175,55,0.2)] h-12 rounded-xl bg-[#D4AF37] text-[#0B0F14] hover:bg-[#E5C354] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In Securely"}
          </button>
        </form>
      </div>
    </div>
  );
}
