'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Компонент для защиты админ маршрутов
 * Проверяет токен в localStorage и перенаправляет на /login если не авторизован
 */
export function AdminProtector({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        if (!token) {
          // Нет токена - перенаправляем на логин
          router.push('/login');
          return;
        }

        // Проверяем валидность токена на сервере
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by';
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthorized(true);
        } else {
          // Токен невалидный
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    // Только проверяем если мы на админ странице
    if (pathname?.startsWith('/admin')) {
      checkAuth();
    }
  }, [pathname, router]);

  if (pathname?.startsWith('/admin') && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2c3a54] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B809E]">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (pathname?.startsWith('/admin') && !isAuthorized) {
    return null; // Будет перенаправлено на /login
  }

  return <>{children}</>;
}
