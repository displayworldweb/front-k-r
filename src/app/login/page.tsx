'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.k-r.by';
      const endpoint = `${apiUrl}/auth/login`;
      console.log('Logging in with endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Сохраняем токен
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        
        // Перенаправляем в админку
        router.push('/admin');
      } else {
        setError(data.message || 'Ошибка при входе');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f6fa] to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2c3a54] mb-2">Каменная Роза</h1>
          <p className="text-[#6B809E]">Вход в административную панель</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e5e7eb]">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#2c3a54] mb-2">
                Логин
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                className="w-full px-4 py-2 border text-black border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#2c3a54] focus:ring-2 focus:ring-[#2c3a54] focus:ring-opacity-20"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2c3a54] mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-2 border text-black border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#2c3a54] focus:ring-2 focus:ring-[#2c3a54] focus:ring-opacity-20"
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2c3a54] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1f2937] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">Тестовые учетные данные:</p>
            <p>Логин: <code className="bg-white px-2 py-1 rounded">admin</code></p>
            <p>Пароль: <code className="bg-white px-2 py-1 rounded">admin123</code></p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-[#2c3a54] hover:underline text-sm">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
