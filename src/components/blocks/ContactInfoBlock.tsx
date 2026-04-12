import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function ContactInfoBlock({ content }: { content: any }) {
  const heading = content.heading || "Get in Touch";
  const body = content.body || "Reach out to us for any inquiries.";

  const settings = await getSettings();

  const address = settings.address || "123 Eco Blvd, Green Tech Park, Mumbai, Maharashtra 400001, India";
  const phone1 = settings.phone_number || "+91 98765 43210";
  const phone2 = settings.phone_number_2 || "+91 12345 67890";
  const email1 = settings.contact_email || "info@ecovistalife.in";
  const email2 = settings.sales_email || "sales@ecovistalife.in";
  const hours = settings.working_hours || "Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed";

  return (
    <div className="w-full">
      <h2 className="text-3xl font-heading font-bold text-[#0F3D3E] mb-6">{heading}</h2>
      <p className="text-gray-600 mb-10 text-lg">{body}</p>
      
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <MapPin className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#0F3D3E] mb-1">Corporate Office</h4>
            <p className="text-gray-600">{address}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <Phone className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#0F3D3E] mb-1">Phone</h4>
            <p className="text-gray-600">{phone1}<br />{phone2}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <Mail className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#0F3D3E] mb-1">Email</h4>
            <p className="text-gray-600">{email1}<br />{email2}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <Clock className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[#0F3D3E] mb-1">Working Hours</h4>
            <p className="text-gray-600 mb-0 whitespace-pre-wrap">{hours.replace("|", "\n")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
