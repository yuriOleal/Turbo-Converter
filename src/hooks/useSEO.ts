import { useEffect } from 'react';

export interface UseSEOOptions {
  title: string;
  description: string;
  url?: string;
}

/**
 * Updates document.title, meta description, and Open Graph tags
 * based on the current page/tool.
 */
export function useSEO(options: UseSEOOptions): void {
  const { title, description, url } = options;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    setMetaTag('name', 'description', description);
  }, [description]);

  useEffect(() => {
    setMetaTag('property', 'og:title', title);
  }, [title]);

  useEffect(() => {
    setMetaTag('property', 'og:description', description);
  }, [description]);

  useEffect(() => {
    const resolvedUrl = url ?? window.location.href;
    setMetaTag('property', 'og:url', resolvedUrl);
  }, [url]);
}

/**
 * Creates or updates a <meta> tag in the document head.
 * @param attr - The attribute used to identify the tag ('name' or 'property')
 * @param key - The value of the identifying attribute (e.g. 'description', 'og:title')
 * @param content - The content value to set
 */
function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}
