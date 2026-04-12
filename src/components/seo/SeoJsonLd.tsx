import { organizationJsonLd } from "@/lib/seo";

/** Organization + WebSite + RealEstateAgent structured data for public pages. */
export function SeoJsonLd() {
  const json = organizationJsonLd();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
