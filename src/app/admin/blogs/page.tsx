"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { Edit2, Trash2, Plus, Image as ImageIcon, Calendar } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Image from "next/image";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    content: "",
    image: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    if (data) setBlogs(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    
    const url = await uploadImage(file);
    if (url) {
      setFormData(prev => ({ ...prev, image: url }));
      toast({ title: "Image uploaded successfully", type: "success" });
    } else {
      toast({ title: "Image upload failed", type: "error" });
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const blogData = {
      title: formData.title,
      content: formData.content,
      image: formData.image,
    };

    if (formData.id) {
      const { error } = await supabase.from("blogs").update(blogData).match({ id: formData.id });
      if (error) toast({ title: "Error updating blog", description: error.message, type: "error" });
      else toast({ title: "Blog updated", type: "success" });
    } else {
      const { error } = await supabase.from("blogs").insert([blogData]);
      if (error) toast({ title: "Error creating blog", description: error.message, type: "error" });
      else toast({ title: "Blog created", type: "success" });
    }
    
    setIsModalOpen(false);
    fetchBlogs();
  };

  const handleEdit = (blog: any) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      image: blog.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return;
    const { error } = await supabase.from("blogs").delete().match({ id });
    if (error) toast({ title: "Error deleting blog", type: "error" });
    else {
      toast({ title: "Blog deleted", type: "success" });
      fetchBlogs();
    }
  };

  const resetForm = () => {
    setFormData({ id: "", title: "", content: "", image: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Manage Blogs</h1>
          <p className="text-gray-400 mt-1 text-sm">Create and edit your publication content.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Compose New Post
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">Loading blog posts...</div>
        ) : blogs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">
            No posts found. Start writing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Post Details</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Published Date</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-[#0B0F14] border border-gray-800 overflow-hidden relative shrink-0 shadow-inner">
                          {blog.image ? (
                            <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-600 m-auto mt-3" size={18} />
                          )}
                        </div>
                        <div className="font-bold text-white text-base">{blog.title}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} className="text-gray-500"/> 
                        {new Date(blog.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(blog)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(blog.id)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F14]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 md:p-10 max-w-4xl w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-8">{formData.id ? "Edit Post" : "Write New Post"}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Blog Title</label>
                <input 
                  required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-xl font-medium"
                  placeholder="Enter a captivating title..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">Cover Image</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {formData.image && (
                    <div className="w-32 h-20 rounded-xl overflow-hidden relative shrink-0 border-2 border-gray-700 shadow-lg">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-grow w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-700 bg-[#0B0F14]/50 rounded-2xl px-6 py-6 hover:bg-[#0B0F14] hover:border-gray-500 transition-colors cursor-pointer group">
                    <ImageIcon size={24} className="text-gray-600 mb-2 group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      {uploading ? "Uploading to storage..." : "Choose cover image"}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Content (Markdown / Rich Text)</label>
                <textarea 
                  required rows={12} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-gray-300 px-5 py-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all font-mono text-sm leading-relaxed whitespace-pre-wrap"
                  placeholder="# Enter your content here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/60 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
