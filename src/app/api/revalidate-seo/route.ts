import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate-seo
 * Инвалидирует кэш SEO данных для указанной страницы
 * 
 * Используется админ панелью при обновлении SEO данных
 * 
 * Тело запроса:
 * {
 *   "pageSlug": "home" | "monuments" | "blogs" | etc,
 *   "revalidateAll": false // если true - инвалидирует все SEO данные
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (простая проверка)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REVALIDATE_TOKEN || 'admin-revalidate-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      // Проверяем, что запрос с админ панели (localhost или внутренний запрос)
      const origin = request.headers.get('origin') || request.headers.get('referer');
      if (!origin?.includes('localhost') && !origin?.includes('127.0.0.1')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const { pageSlug, revalidateAll } = await request.json();

    if (revalidateAll) {
      // Инвалидируем все SEO данные
      revalidateTag('seo-data', {});
      console.log('[Revalidate] Инвалидированы все SEO данные');
      
      return NextResponse.json(
        { success: true, message: 'Все SEO данные инвалидированы' },
        { status: 200 }
      );
    }

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'pageSlug is required' },
        { status: 400 }
      );
    }

    // Инвалидируем кэш для конкретной страницы
    revalidateTag(`seo-${pageSlug}`, {});
    console.log(`[Revalidate] SEO кэш инвалидирован для страницы: ${pageSlug}`);

    return NextResponse.json(
      { success: true, message: `SEO кэш инвалидирован для ${pageSlug}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Revalidate] Ошибка при инвалидации кэша:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
