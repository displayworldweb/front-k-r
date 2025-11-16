import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function useAdminEdit() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setCheckingAuth(false);
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  return { user, checkingAuth };
}

export function AdminAuthGuard({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Проверка доступа...</p>
      </div>
    );
  }

  return <>{children}</>;
}
