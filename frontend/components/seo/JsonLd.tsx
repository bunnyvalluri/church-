/**
 * components/seo/JsonLd.tsx
 * Injects Schema.org JSON-LD into <head> on server components.
 * Accepts any valid schema object or array of schema objects.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}
