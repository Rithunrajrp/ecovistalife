import type { Metadata } from "next";

/** Public site origin — set in production: NEXT_PUBLIC_SITE_URL=https://ecovistalife.in */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "https://ecovistalife.in";
}

export const SITE_NAME = "EcoVistaLife";

/** Primary meta description — used across pages; keep under ~160 chars for snippets where possible. */
export const SEO_DEFAULT_DESCRIPTION =
  "EcoVistaLife builds premium sustainable real estate in Mumbai & India — eco-friendly luxury homes, green construction, new residential projects & site visits. Eco Vista life, reimagined.";

/**
 * Keyword themes: brand, eco/sustainability, construction, geography, intent.
 * Modern search uses content more than meta keywords; we still set keywords for other engines/tools.
 */
export const SEO_KEYWORDS = [
  "EcoVistaLife",
  "Eco Vista",
  "Eco Vista Life",
  "Ecovista",
  "eco real estate",
  "sustainable real estate India",
  "green building Mumbai",
  "eco friendly construction",
  "sustainable construction company",
  "luxury sustainable homes",
  "premium construction Mumbai",
  "residential construction India",
  "commercial building development",
  "Mumbai real estate developer",
  "Maharashtra luxury properties",
  "green architecture",
  "energy efficient buildings",
  "sustainable housing projects",
  "luxury villas Mumbai",
  "premium apartments Mumbai",
  "upcoming real estate projects",
  "ongoing construction projects",
  "completed luxury projects",
  "real estate investment India",
  "eco luxury lifestyle",
  "sustainable urban development",
  "building and construction",
  "construction and development",
  "site visit luxury homes",
  "new launch premium homes",
  "smart sustainable homes",
  "low carbon construction",
  "nature integrated living",
  "premium sustainable lifestyle",
] as const;

export function buildRootMetadata(): Metadata {
  const base = getSiteUrl();
  return {
    metadataBase: new URL(base),
    title: {
      default: `${SITE_NAME} | Sustainable Luxury Real Estate & Construction`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: SITE_NAME, url: base }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      alternateLocale: ["en_US"],
      url: base,
      siteName: SITE_NAME,
      title: `${SITE_NAME} | Sustainable Luxury Real Estate & Construction`,
      description: SEO_DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | Sustainable Luxury Real Estate`,
      description: SEO_DEFAULT_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "Real estate",
    other: {
      "geo.region": "IN-MH",
      "geo.placename": "Mumbai",
    },
  };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE_NAME,
        url,
        description: SEO_DEFAULT_DESCRIPTION,
        logo: { "@type": "ImageObject", url: `${url}/window.svg` },
        sameAs: [] as string[],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mumbai",
          addressRegion: "Maharashtra",
          addressCountry: "IN",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_NAME,
        description: SEO_DEFAULT_DESCRIPTION,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en-IN",
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${url}/#realestate`,
        name: SITE_NAME,
        url,
        description: SEO_DEFAULT_DESCRIPTION,
        parentOrganization: { "@id": `${url}/#organization` },
        areaServed: { "@type": "AdministrativeArea", name: "India" },
      },
    ],
  };
}
