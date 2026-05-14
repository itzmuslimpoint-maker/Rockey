import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  schema?: any;
}

const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogType = 'website', 
  ogImage = 'https://dmflow.site/images/og-image.jpg', 
  noindex = false,
  schema 
}: SEOProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // OG Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:type': ogType,
      'og:image': ogImage,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Tags
    const twitterTags = {
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Schema
    if (schema) {
      let scriptSchema = document.querySelector('script[type="application/ld+json"].dynamic-schema');
      if (!scriptSchema) {
        scriptSchema = document.createElement('script');
        scriptSchema.setAttribute('type', 'application/ld+json');
        scriptSchema.classList.add('dynamic-schema');
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(schema);
    } else {
      const scriptSchema = document.querySelector('script[type="application/ld+json"].dynamic-schema');
      if (scriptSchema) scriptSchema.remove();
    }
  }, [title, description, canonical, ogType, ogImage, schema]);

  return null;
};

export default SEO;
