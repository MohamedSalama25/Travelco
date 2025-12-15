import { notFound } from 'next/navigation';

const locales = ['en', 'ar'];

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  return <>{children}</>;
}
