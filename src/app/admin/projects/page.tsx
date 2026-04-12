"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { Edit2, Trash2, Plus, Image as ImageIcon, MapPin } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Image from "next/image";

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    type: "ongoing",
    location: "",
    price: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    
    // Warning: You must create 'public-images' bucket in supabase manually for this to work natively
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
    
    const projectData = {
      title: formData.title,
      type: formData.type,
      location: formData.location,
      price: formData.price,
      description: formData.description,
      images: formData.image ? [formData.image] : [],
      // keeping backward compatibility with existing image field rendering in DB
      image: formData.image,
    };

    if (formData.id) {
      const { error } = await supabase.from("projects").update(projectData).match({ id: formData.id });
      if (error) toast({ title: "Error updating project", description: error.message, type: "error" });
      else toast({ title: "Project updated", type: "success" });
    } else {
      const { error } = await supabase.from("projects").insert([projectData]);
      if (error) toast({ title: "Error creating project", description: error.message, type: "error" });
      else toast({ title: "Project created", type: "success" });
    }
    
    setIsModalOpen(false);
    fetchProjects();
  };

  const handleEdit = (project: any) => {
    setFormData({
      id: project.id,
      title: project.title,
      type: project.type,
      location: project.location,
      price: project.price,
      description: project.description || "",
      image: project.image || (project.images ? project.images[0] : ""),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this project?")) return;
    const { error } = await supabase.from("projects").delete().match({ id });
    if (error) toast({ title: "Error deleting project", type: "error" });
    else {
      toast({ title: "Project deleted", type: "success" });
      fetchProjects();
    }
  };

  const resetForm = () => {
    setFormData({ id: "", title: "", type: "ongoing", location: "", price: "", description: "", image: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Manage Projects</h1>
          <p className="text-gray-400 mt-1 text-sm">Control your real estate portfolio.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Add New Project
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">
            No projects found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Project Info</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Value</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#0B0F14] border border-gray-800 overflow-hidden relative shrink-0 shadow-inner">
                          {project.image || (project.images && project.images[0]) ? (
                            <Image src={project.image || project.images[0]} alt={project.title} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-600 m-auto mt-4" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">{project.title}</div>
                          <div className="text-gray-500 text-xs mt-1 flex items-center gap-1"><MapPin size={12}/> {project.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        project.type === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        project.type === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {project.type}
                      </span>
                    </td>
                    <td className="p-6 font-semibold text-gray-300">{project.price}</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(project)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(project.id)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F14]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 md:p-10 max-w-3xl w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-8">{formData.id ? "Edit Project" : "Add New Project"}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Project Title</label>
                  <input 
                    required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Status Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all appearance-none"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Location</label>
                  <input 
                    required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Price Range</label>
                  <input 
                    required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                <textarea 
                  rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">Project Image</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {formData.image && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden relative shrink-0 border-2 border-gray-700 shadow-lg">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="flex-grow w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-700 bg-[#0B0F14]/50 rounded-2xl px-6 py-8 hover:bg-[#0B0F14] hover:border-gray-500 transition-colors cursor-pointer group">
                    <ImageIcon size={28} className="text-gray-600 mb-3 group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      {uploading ? "Uploading to secure cloud..." : "Click to browse or drag & drop image"}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/60 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2">
                  Save Project Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
