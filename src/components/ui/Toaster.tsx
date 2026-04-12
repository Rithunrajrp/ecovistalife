"use client";
import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error";
};

let toastListeners: ((t: ToastMessage) => void)[] = [];

export const toast = (message: Omit<ToastMessage, "id">) => {
  const id = Math.random().toString(36).substr(2, 9);
  toastListeners.forEach((listener) => listener({ ...message, id }));
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAdd = (toastMsg: ToastMessage) => {
      setToasts((prev) => [...prev, toastMsg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastMsg.id));
      }, 4000);
    };
    toastListeners.push(handleAdd);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== handleAdd);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-[#111827] border border-gray-800 text-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-start gap-4 animate-in slide-in-from-right-8 fade-in min-w-[300px]">
          {t.type === 'success' ? (
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          )}
          <div className="flex-grow pr-4">
            <h4 className="font-semibold text-sm">{t.title}</h4>
            {t.description && <p className="text-xs text-gray-400 mt-1">{t.description}</p>}
          </div>
          <button onClick={() => setToasts(toasts.filter(tx => tx.id !== t.id))} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
