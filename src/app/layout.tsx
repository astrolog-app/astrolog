import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import StateProvider from '@/context/stateProvider';
import { Toaster } from '@/components/ui/toaster';
import { ModalProvider } from '@/context/modalProvider';
import { ProcessProvider } from '@/context/processProvider';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AstroLog',
  description: 'AstroLog is an astrophotography application that lets you log and classify all your imaging sessions - by its own or manually.'
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
        <ProcessProvider>
          <ModalProvider>
            {children}
            <Toaster />
          </ModalProvider>
        </ProcessProvider>
      </StateProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
