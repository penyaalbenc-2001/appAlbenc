import Navigation from '@/components/Navigation';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: "Penya l'Albenc",
  description: "Gestió i activitats de la Penya l'Albenc",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Albenc",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.jpeg",
    apple: "/apple-icon.jpeg"
  }
};

import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html lang="ca-VA">
      <body>
        <LanguageProvider>
          <main className="fade-in">
            {children}
          </main>
          <Navigation />
        </LanguageProvider>
      </body>
    </html>
  );
}
