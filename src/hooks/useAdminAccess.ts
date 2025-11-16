import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function useAdminAccess() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('adminUser');
        const token = localStorage.getItem('adminToken');

        if (!userStr || !token) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const hasAccess = (requiredRole: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  };

  const canAccessSEO = (): boolean => {
    return user?.role === 'superadmin';
  };

  const canEditProducts = (): boolean => {
    // admin может создавать/редактировать товары, superadmin тоже
    return ['admin', 'superadmin'].includes(user?.role || '');
  };

  return { user, loading, hasAccess, canAccessSEO, canEditProducts };
}
