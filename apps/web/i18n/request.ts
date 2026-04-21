import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'bn', 'ar'];

export default getRequestConfig(async ({ locale: paramLocale, requestLocale }) => {
  // Newer versions of next-intl use requestLocale (a Promise)
  // Older versions use locale
  let locale = paramLocale || (await requestLocale);
  
  console.log('getRequestConfig resolved locale:', locale);

  if (!locale || !locales.includes(locale as any)) {
    console.log('Invalid or missing locale in getRequestConfig, falling back to en');
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

