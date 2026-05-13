import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ScrapeScout AI — Global AI-Powered Opportunity Discovery',
  description:
    'Discover scholarships, fellowships, accelerators, grants, competitions, and more. Curated for students, founders, researchers, and creators worldwide.',
  keywords: [
    'scholarship', 'fellowship', 'accelerator', 'grant', 'startup', 'opportunity',
    'india', 'global', 'students', 'women founders',
  ],
  openGraph: {
    title: 'ScrapeScout AI',
    description: 'AI-Powered Global Opportunity Discovery',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-950 text-white">{children}</body>
    </html>
  );
}
