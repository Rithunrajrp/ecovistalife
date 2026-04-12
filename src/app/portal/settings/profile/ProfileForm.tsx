'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, User, Mail, Phone, Camera } from 'lucide-react'
import Link from 'next/link'

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string
    email: string
    phone: string | null
    role: string
    avatar_url: string | null
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile.id)

    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
  }

  const inputClass = 'w-full bg-[#0d1220] border border-gray-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37]/60 text-sm transition-all placeholder-gray-600'
  const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-[#D4AF37]">
              {form.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </span>
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#D4AF37] rounded-full flex items-center justify-center text-black hover:bg-[#E5C354] transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="text-white font-semibold">{profile.full_name}</p>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 capitalize">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>

        <div>
          <label className={labelClass}>Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={inputClass + ' pl-10'}
              placeholder="Your full name"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email"
              value={profile.email}
              disabled
              className={inputClass + ' pl-10 opacity-50 cursor-not-allowed'}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1.5">Email address cannot be changed here.</p>
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className={inputClass + ' pl-10'}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      </div>

      {/* Role info (non-editable) */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Role</p>
            <p className="text-white font-medium capitalize">{profile.role}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Account ID</p>
            <p className="text-gray-400 font-mono text-xs truncate">{profile.id}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">Role and account details are managed by your administrator.</p>
      </div>

      {/* Save / Feedback */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
