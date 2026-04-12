"use client";
import { useEffect, useState } from "react";
import { FolderKanban, FileText, MessageSquare, TrendingUp, Settings, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    enquiries: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: projectsCount },
        { count: blogsCount },
        { count: enquiriesCount }
      ] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("enquiries").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        projects: projectsCount || 0,
        blogs: blogsCount || 0,
        enquiries: enquiriesCount || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Projects", value: stats.projects, icon: FolderKanban, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10 border-[#D4AF37]/20" },
    { title: "Published Blogs", value: stats.blogs, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { title: "Total Enquiries", value: stats.enquiries, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { title: "Conversion Rate", value: "8.4%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2 text-sm">Welcome back to the EcoVistaLife admin panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#111827] border border-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 hover:border-gray-700">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-1.5">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-xl text-white">Recent Enquiries</h3>
            <Link href="/admin/enquiries" className="text-sm font-semibold text-[#D4AF37] hover:text-[#E5C354] flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-8 flex-grow">
            <div className="p-6 bg-[#0B0F14] rounded-2xl text-sm text-gray-400 border border-gray-800/50 text-center h-full flex flex-col items-center justify-center gap-2">
              <MessageSquare size={32} className="text-gray-700 mb-2" />
              <p>Navigate to the <span className="font-semibold text-white mx-1">Enquiries</span> tab to securely view and manage all incoming leads.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl">
          <div className="p-8 border-b border-gray-800">
            <h3 className="font-bold text-xl text-white">Quick Actions</h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col gap-4">
              <Link href="/admin/projects" className="p-5 bg-[#0B0F14] hover:bg-[#1a2333] border border-gray-800 hover:border-gray-700 rounded-2xl text-sm font-semibold text-gray-200 transition-all flex items-center justify-between group shadow-inner">
                <span className="flex items-center gap-4"><FolderKanban size={20} className="text-[#D4AF37]" /> Manage Projects</span>
                <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-[#D4AF37]">&rarr;</span>
              </Link>
              <Link href="/admin/blogs" className="p-5 bg-[#0B0F14] hover:bg-[#1a2333] border border-gray-800 hover:border-gray-700 rounded-2xl text-sm font-semibold text-gray-200 transition-all flex items-center justify-between group shadow-inner">
                <span className="flex items-center gap-4"><FileText size={20} className="text-[#D4AF37]" /> Write a Blog Post</span>
                <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-[#D4AF37]">&rarr;</span>
              </Link>
              <Link href="/admin/settings" className="p-5 bg-[#0B0F14] hover:bg-[#1a2333] border border-gray-800 hover:border-gray-700 rounded-2xl text-sm font-semibold text-gray-200 transition-all flex items-center justify-between group shadow-inner">
                <span className="flex items-center gap-4"><Settings size={20} className="text-[#D4AF37]" /> Update Site Settings</span>
                <span className="opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-[#D4AF37]">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
