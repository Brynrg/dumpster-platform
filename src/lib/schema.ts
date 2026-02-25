type LocalBusinessInput = {
  name: string;
  areaServed: string[];
  url: string;
};

type ServiceInput = {
  serviceName: string;
  areaServed: string[];
  url: string;
};

export function buildLocalBusinessSchema({
  name,
  areaServed,
  url,
}: LocalBusinessInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
    areaServed,
    sameAs: [] as string[],
  };
}

export function buildServiceSchema({
  serviceName,
  areaServed,
  url,
}: ServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    serviceType: serviceName,
    areaServed,
    url,
  };
}
