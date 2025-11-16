'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PasswordStrength {
  score: number;
  feedback: string;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: '',
  });

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('минимум 8 символов');
    }

    if (password.length >= 12) {
      score += 20;
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('строчные буквы (a-z)');
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('прописные буквы (A-Z)');
    }

    if (/\d/.test(password)) {
      score += 10;
    } else {
      feedback.push('цифры (0-9)');
    }

    if (/@$!%*?&/.test(password)) {
      score += 10;
    } else {
      feedback.push('спецсимволы (!@#$%^&*()_-+=[]{};\'"\\|,.<>?/~`)');
    }

    let strengthText = '';
    if (score < 40) strengthText = 'Слабый';
    else if (score < 70) strengthText = 'Средний';
    else if (score < 90) strengthText = 'Хороший';
    else strengthText = 'Отличный';

    return {
      score: Math.min(score, 100),
      feedback: feedback.length > 0 
        ? `${strengthText}. Добавьте: ${feedback.join(', ')}`
        : `${strengthText}. Пароль надёжный!`,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Заполните все поля' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Новые пароли не совпадают' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Пароль должен быть не менее 8 символов' });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>?/~`])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};':"\\|,.<>?/~`]{8,}$/.test(formData.newPassword)) {
      setMessage({ 
        type: 'error', 
        text: 'Пароль должен содержать прописные буквы, строчные буквы, цифры и спецсимволы' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by';

      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Пароль успешно изменён!' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStrength({ score: 0, feedback: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Ошибка при изменении пароля' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Ошибка сервера. Попробуйте позже.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">⚙️ Настройки аккаунта</h1>
          <Link href="/admin" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition">
            ← Назад
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">🔐 Смена пароля</h2>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg font-semibold ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Текущий пароль
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Введите текущий пароль"
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 pr-10 text-black border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    current: !prev.current
                  }))}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-lg"
                >
                  {showPasswords.current ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Введите новый пароль"
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 pr-10 text-black border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    new: !prev.new
                  }))}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-lg"
                >
                  {showPasswords.new ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>

              {formData.newPassword && (
                <div className="mt-3">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength.score < 40 ? 'bg-red-500' :
                        passwordStrength.score < 70 ? 'bg-yellow-500' :
                        passwordStrength.score < 90 ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Подтвердите новый пароль
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Подтвердите новый пароль"
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 pr-10 text-black border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    confirm: !prev.confirm
                  }))}
                  disabled={loading}
                  className="absolute right-3 top-2.5 text-lg"
                >
                  {showPasswords.confirm ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>

              {formData.newPassword && formData.confirmPassword && (
                <p className={`text-sm font-semibold mt-2 ${
                  formData.newPassword === formData.confirmPassword 
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formData.newPassword === formData.confirmPassword 
                    ? '✅ Пароли совпадают'
                    : '❌ Пароли не совпадают'
                  }
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Изменение...' : '💾 Изменить пароль'}
            </button>
          </form>

          <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">📋 Требования к паролю:</h3>
            <ul className="space-y-2">
              <li className="text-slate-700">✓ Минимум 8 символов</li>
              <li className="text-slate-700">✓ Прописные буквы (A-Z)</li>
              <li className="text-slate-700">✓ Строчные буквы (a-z)</li>
              <li className="text-slate-700">✓ Цифры (0-9)</li>
              <li className="text-slate-700">✓ Спецсимволы: ! @ # $ % ^ &amp; * ( ) _ - + = [ ] {'{'} {'}'}  ; ' &quot; | , . &lt; &gt; ? / ~ `</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
