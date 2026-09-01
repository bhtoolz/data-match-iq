import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Data Match IQ — McGrath · AgentIQ Property Matching',
  description: 'Internal Australian property list normalisation, Agentbox contact matching, and call list export platform for McGrath Real Estate.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f9f8f6] text-[#1a1c20] antialiased selection:bg-[#0f3d52] selection:text-white">
        {children}
      </body>
    </html>
  );
}
