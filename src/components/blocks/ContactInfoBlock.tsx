import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function ContactInfoBlock({ content }: { content: any }) {
  const heading = content.heading || "Get in Touch";
  const body = content.body || "Reach out to us for any inquiries.";
  // Only use first sentence as intro, ignore raw address dumps from seed
  const introText = body.split("\n")[0];

  const settings = await getSettings();

  const address = settings.address || "123 Eco Blvd, Green Tech Park, Mumbai, Maharashtra 400001, India";
  const phone1 = settings.phone_number || "+91 98765 43210";
  const phone2 = settings.phone_number_2 || "";
  const email1 = settings.contact_email || "info@ecovistalife.in";
  const email2 = settings.sales_email || "";
  const hours = settings.working_hours || "Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed";

  const items = [
    {
      icon: MapPin,
      label: "Corporate Office",
      value: address,
    },
    {
      icon: Phone,
      label: "Phone",
      value: [phone1, phone2].filter(Boolean).join("\n"),
    },
    {
      icon: Mail,
      label: "Email",
      value: [email1, email2].filter(Boolean).join("\n"),
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: hours.replace("|", "\n"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0F3D3E] mb-4">{heading}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{introText}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0F3D3E]/5 flex items-center justify-center shrink-0">
                <item.icon className="text-[#D4AF37]" size={26} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#0F3D3E] mb-1">{item.label}</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
