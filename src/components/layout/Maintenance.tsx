"use client";

import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { useEffect, useState } from "react";

export function Maintenance({ onRetry }: { onRetry?: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch on the server side

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl px-8 py-16 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* Simple Icon */}
        <motion.div
          className="mb-8 p-6 bg-slate-800/50 rounded-full border border-slate-700/50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Database size={64} className="text-emerald-400" strokeWidth={1.5} />
        </motion.div>

        {/* Text Copy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <span className="text-amber-400/90 font-semibold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            System Maintenance
          </span>
          <h1 className="text-3xl md:text-4xl font-medium mb-6 tracking-tight text-white drop-shadow-sm">
            We're Restoring Our Infrastructure
          </h1>
          <p className="text-base text-slate-400 leading-relaxed mb-10 max-w-sm">
            Our systems are currently offline and undergoing a restoration process. Services will return shortly.
          </p>

          <button 
            onClick={onRetry ? onRetry : () => window.location.reload()}
            className="group relative px-8 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full font-medium transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            Check Status
          </button>
        </motion.div>

      </div>
    </div>
  );
}
