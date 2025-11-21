'use client';

import { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Reload to load metrika if needed
    window.location.reload();
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-200">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm mb-2 md:mb-0">
          Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
          <a href="/cookies" className="underline">Политикой использования файлов cookie</a>.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={declineCookies}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
          >
            Отклонить
          </button>
          <button
            onClick={acceptCookies}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;