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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["products"]);

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

  const menuGroups = [
    {
      label: "Основное",
      icon: "🏠",
      items: [
        { href: "/admin", label: "Панель управления", icon: "📊" },
        { href: "/admin/settings", label: "Настройки", icon: "⚙️" },
      ],
    },
    {
      label: "Контент",
      icon: "📝",
      expanded: true,
      items: [
        { href: "/admin/pages", label: "Описания страниц", icon: "📄" },
        { href: "/admin/campaigns", label: "Акции", icon: "🎯" },
        { href: "/admin/blogs", label: "Блоги", icon: "📝" },
      ],
    },
    {
      label: "Товары",
      icon: "🛍️",
      expanded: true,
      items: [
        { href: "/admin/monuments", label: "Памятники", icon: "🏛️" },
        { href: "/admin/epitaphs", label: "Эпитафии", icon: "✝️" },
        { href: "/admin/accessories", label: "Аксессуары", icon: "💎" },
        { href: "/admin/fences", label: "Ограды", icon: "🚧" },
        { href: "/admin/landscape", label: "Landscape", icon: "🌳" },
      ],
    },
    {
      label: "Портфолио",
      icon: "📸",
      items: [
        { href: "/admin/works", label: "Готовые работы", icon: "📸" },
      ],
    },
    {
      label: "Импорт",
      icon: "📥",
      items: [
        { href: "/admin/import", label: "Импорт памятников", icon: "📥" },
      ],
    },
    ...(isSuperadmin ? [{
      label: "SEO",
      icon: "🔍",
      items: [
        { href: "/admin/seo", label: "SEO Управление", icon: "🔍" },
        { href: "/admin/seo/templates", label: "SEO Шаблоны", icon: "📋" },
      ],
    }] : []),
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(m => m !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/seo") return pathname === "/admin/seo";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-4 sticky top-0 bg-gray-800 z-10">
          <h1 className="text-xl font-bold text-white">Админ Панель</h1>
          <p className="text-gray-400 text-xs">Управление</p>
        </div>

        <nav className="space-y-1 px-2 py-4">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => toggleMenu(group.label)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <span>{group.icon}</span>
                <span className="flex-1 text-left">{group.label}</span>
                <span className={`text-xs transform transition-transform ${expandedMenus.includes(group.label) ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {expandedMenus.includes(group.label) && (
                <div className="pl-4 space-y-1 mt-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isActive(item.href)
                          ? "bg-blue-600 text-white font-semibold"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700 bg-gray-800 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <span>←</span>
            <span>На сайт</span>
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
