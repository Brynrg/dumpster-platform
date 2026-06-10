import React from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  // To avoid XSS, we safely stringify the data by escaping `<` to `\u003c`
  // This prevents attackers from closing the script tag using `</script>`
  const safeJsonLd = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd }}
    />
  );
}
