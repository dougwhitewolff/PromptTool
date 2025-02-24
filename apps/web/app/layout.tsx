// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';
import ErrorBoundaryWrapper from '@/app/prompt-tool/components/ErrorBoundaryWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Inversity - Interactive Mathematics Learning',
  description:
    'Learn mathematics through interactive experiences and AI tutoring',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ErrorBoundaryWrapper>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
