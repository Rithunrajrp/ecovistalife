import { FooterBlock } from "@/components/blocks/FooterBlock";
import { getSiteFooter } from "@/lib/cms";
import { getSettings } from "@/lib/settings";

export async function Footer({ pages = [] }: { pages?: { name: string; href: string }[] }) {
  const settings = await getSettings();
  const site = await getSiteFooter();

  const base = (site?.content || {}) as Record<string, any>;

  const content = {
    brandName: base.brandName ?? settings.company_name ?? "EcoVistaLife",
    tagline:
      base.tagline ??
      settings.footer_tagline ??
      "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.",
    address: base.address ?? settings.address ?? "123 Eco Blvd, Mumbai, Maharashtra, India 400001",
    phone: base.phone ?? settings.phone_number ?? "+91 98765 43210",
    email: base.email ?? settings.contact_email ?? "info@ecovistalife.in",
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
