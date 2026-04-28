import { FooterBlock } from "@/components/blocks/FooterBlock";
import { getSiteFooter } from "@/lib/cms";
import { getSettings } from "@/lib/settings";

export async function Footer({ pages = [] }: { pages?: { name: string; href: string }[] }) {
  const settings = await getSettings();
  const site = await getSiteFooter();

  const base = (site?.content || {}) as Record<string, any>;

  const content = {
    brandName: settings.company_name || base.brandName || "EcoVistaLife",
    tagline:
      settings.footer_tagline ||
      base.tagline ||
      "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.",
    address: settings.address || base.address || "123 Eco Blvd, Mumbai, Maharashtra, India 400001",
    phone: settings.phone_number || base.phone || "+91 98765 43210",
    email: settings.contact_email || base.email || "info@ecovistalife.in",
    socialLinks: base.socialLinks ?? {
      facebook: settings.social_facebook || "#",
      instagram: settings.social_instagram || "#",
      linkedin: settings.social_linkedin || "#",
      twitter: settings.social_twitter || "#",
    },
    columns: base.columns,
  };

  const siteSettings =
    site?.settings && Object.keys(site.settings).length > 0
      ? site.settings
      : { bgColor: "#0F3D3E", textColor: "#ffffff" };

  return <FooterBlock content={content} settings={siteSettings} navPages={pages} />;
}
