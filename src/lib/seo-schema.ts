/**
 * Schema.org (JSON-LD) микроразметка для SEO
 */

export const schemaOrganization = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://k-r.by",
  name: "Каменная Роза",
  description:
    "Производство и установка памятников, оград, аксессуаров из гранита",
  image: "https://k-r.by/logo.png",
  url: "https://k-r.by",
  telephone: "+375333226652",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Терешковой 9Б",
    addressLocality: "Витебск",
    postalCode: "210000",
    addressCountry: "BY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "54.1837",
    longitude: "29.2325",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
  sameAs: [
    "https://www.facebook.com",
    "https://www.instagram.com",
    "https://www.youtube.com",
  ],
};

export const schemaProduct = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: product.image,
  url: `https://k-r.by${product.url}`,
  brand: {
    "@type": "Brand",
    name: "Каменная Роза",
  },
  manufacturer: {
    "@type": "Organization",
    name: "Каменная Роза",
  },
  ...(product.price && {
    offers: {
      "@type": "Offer",
      url: `https://k-r.by${product.url}`,
      priceCurrency: "BYN",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  }),
});

export const schemaBlogPosting = (article: any) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: article.title,
  description: article.description,
  image: article.image,
  author: {
    "@type": "Organization",
    name: "Каменная Роза",
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  url: `https://k-r.by${article.url}`,
});

export const schemaFAQ = (items: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const schemaBreadcrumb = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `https://k-r.by${item.url}`,
  })),
});

export const schemaLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://k-r.by",
  name: "Каменная Роза",
  image:
    "https://k-r.by/monuments.jpg",
  description:
    "Компания по производству и установке памятников, оград и аксессуаров из гранита в Витебске",
  url: "https://k-r.by",
  telephone: "+375333226652",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    telephone: "+375333226652",
    availableLanguage: ["Russian"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Терешковой 9Б",
    addressLocality: "Витебск",
    postalCode: "210000",
    addressCountry: "BY",
  },
  priceRange: "$$",
};
