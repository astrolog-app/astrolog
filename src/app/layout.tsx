import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import StateProvider from '@/context/stateProvider';
import { Toaster } from '@/components/ui/toaster';
import { ModalProvider } from '@/context/modalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
};

export default function RootLayout(
  {
    children
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <ThemeProvider attribute="class" defaultTheme="system">
      <StateProvider>
        <ModalProvider>
          {children}
          <Toaster />
        </ModalProvider>
      </StateProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
