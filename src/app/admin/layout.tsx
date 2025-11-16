"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    setLoading(false);
  }, []);

  const isSuperadmin = user?.role === 'superadmin';

  const menuItems = [
    { href: "/admin", label: "Панель управления", icon: "📊" },
    { href: "/admin/pages", label: "Описания страниц", icon: "📄" },
    { href: "/admin/epitaphs", label: "Эпитафии", icon: "✝️" },
    { href: "/admin/campaigns", label: "Акции", icon: "🎯" },
    { href: "/admin/accessories", label: "Аксессуары", icon: "💎" },
    { href: "/admin/fences", label: "Ограды", icon: "🚧" },
    { href: "/admin/landscape", label: "Landscape", icon: "🌳" },
    { href: "/admin/blogs", label: "Блоги", icon: "📝" },
    { href: "/admin/monuments", label: "Памятники", icon: "🏛️" },
    { href: "/admin/works", label: "Готовые работы", icon: "📸" },
    ...(isSuperadmin ? [
      { href: "/admin/seo", label: "SEO", icon: "🔍" },
      { href: "/admin/seo/templates", label: "SEO Шаблоны", icon: "📋" },
    ] : []),
    { href: "/admin/settings", label: "Настройки аккаунта", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">Админ Панель</h1>
          <p className="text-gray-400 text-sm">Управление контентом</p>
        </div>

        <nav className="space-y-2 px-4 py-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
          >
            <span>←</span>
            <span>На главную</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
