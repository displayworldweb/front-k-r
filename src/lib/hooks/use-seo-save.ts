import { useState } from 'react';
import { SeoFieldsData } from '@/components/admin/SeoFieldsForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

export function useSeoSave(entityType: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSeoFields = async (
    entityId: number,
    data: SeoFieldsData
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/admin/${entityType}/${entityId}/seo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Ошибка при сохранении SEO');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveSeoFields, isLoading, error };
}
