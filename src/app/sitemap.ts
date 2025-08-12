import type { MetadataRoute } from 'next';
const staticRoutes: MetadataRoute.Sitemap = [
  // Landing page
  {
    url: `${process.env.NEXTAUTH_URL}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },

  // Login page
  {
    url: `${process.env.NEXTAUTH_URL}/login`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },

  // Features page
  {
    url: `${process.env.NEXTAUTH_URL}/#features`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },

  // Testimonials page
  {
    url: `${process.env.NEXTAUTH_URL}/#testimonials`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },

  // Pricing page
  {
    url: `${process.env.NEXTAUTH_URL}/#pricing`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },

  // FAQ page
  {
    url: `${process.env.NEXTAUTH_URL}/#faq`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes;
}
