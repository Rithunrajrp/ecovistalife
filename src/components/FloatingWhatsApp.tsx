import { MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export async function FloatingWhatsApp() {
  const { data } = await supabase.from("settings").select("value").eq("key", "whatsapp_number").single();
  const whatsappNumber = data?.value || "919876543210";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 flex items-center justify-center right-6 w-14 h-14 bg-green-500 rounded-full text-white shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
      <MessageCircle size={28} className="relative z-10" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none origin-right">
        Chat with us
      </span>
    </a>
  );
}
