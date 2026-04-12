export type CompositionInnerType =
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "spacer"
  | "divider"
  | "form";

export interface CompositionInnerBlock {
  id: string;
  type: CompositionInnerType;
  props: Record<string, unknown>;
}

export function newInnerId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createCompositionInner(type: CompositionInnerType): CompositionInnerBlock {
  const id = newInnerId();
  switch (type) {
    case "heading":
      return { id, type, props: { text: "Heading", level: "h2" } };
    case "paragraph":
      return { id, type, props: { text: "Add your text here. You can combine multiple sections in this one block." } };
    case "image":
      return {
        id,
        type,
        props: {
          url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200",
          alt: "",
          caption: "",
        },
      };
    case "button":
      return { id, type, props: { label: "Learn more", href: "/", variant: "primary" } };
    case "spacer":
      return { id, type, props: { height: 24 } };
    case "divider":
      return { id, type, props: {} };
    case "form":
      return { id, type, props: { formId: "", heading: "", buttonText: "Submit" } };
    default:
      return { id, type: "paragraph", props: { text: "" } };
  }
}

export const COMPOSITION_INNER_LABELS: Record<CompositionInnerType, string> = {
  heading: "Heading",
  paragraph: "Text",
  image: "Image",
  button: "Button",
  spacer: "Spacer",
  divider: "Divider",
  form: "Form",
};

export function defaultCompositionContent(): { items: CompositionInnerBlock[] } {
  return {
    items: [createCompositionInner("heading"), createCompositionInner("paragraph")],
  };
}
