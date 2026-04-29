import { TRPCProvider } from '@/components/providers/TRPCProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SmartNavigation } from '@/components/SmartNavigation';
import '@/styles/globals.css';

export const metadata = {
  title: 'Туризм по крупным городам России',
  description: 'Путешествуйте по России с комфортом',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <TRPCProvider>
          <AuthProvider>
            <ProtectedRoute>
              <SmartNavigation />
              <div className="page-content">{children}</div>
            </ProtectedRoute>
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}