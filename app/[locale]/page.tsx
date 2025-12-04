import { redirect } from '@/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    redirect({ href: '/dashboard', locale });
}
