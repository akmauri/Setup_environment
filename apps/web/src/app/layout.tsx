import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MPCAS2 - Multi-Platform Content Automation System',
  description: 'Automate content creation and distribution across social media platforms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
