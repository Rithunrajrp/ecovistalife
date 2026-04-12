"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    try {
      const { error } = await supabase.from("enquiries").insert([data]);
      if (error) throw error;
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting form", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      {status === "success" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
          Thank you! Your enquiry has been submitted successfully. Our team will contact you shortly.
        </div>
      )}
      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          There was an error submitting your form. Please try again or contact us directly.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#0F3D3E] mb-2">Full Name <span className="text-red-500">*</span></label>
          <Input id="name" name="name" required placeholder="John Doe" className="bg-gray-50 border-gray-200" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#0F3D3E] mb-2">Phone Number <span className="text-red-500">*</span></label>
          <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" className="bg-gray-50 border-gray-200" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#0F3D3E] mb-2">Email Address <span className="text-red-500">*</span></label>
        <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-gray-50 border-gray-200" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#0F3D3E] mb-2">Your Message <span className="text-red-500">*</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
          placeholder="I am interested in..."
        ></textarea>
      </div>
      <Button type="submit" className="w-full shadow-md text-base" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Submit Enquiry"}
      </Button>
    </form>
  );
}
