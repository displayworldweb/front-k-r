# Интеграция SEO в админ страницы - Чек-лист

## ✅ ГОТОВО
- [x] `/admin/monuments/page.tsx` - **ПОЛНОСТЬЮ ИНТЕГРИРОВАНО**
- [x] `/admin/fences/page.tsx` - **ПОЛНОСТЬЮ ИНТЕГРИРОВАНО**

## ⏳ НУЖНО СДЕЛАТЬ

### 1. `/admin/accessories/page.tsx`
**Entity Type**: `accessories`

Шаги:
- [ ] Добавить импорты SeoFieldsForm и useSeoSave
- [ ] Добавить SEO поля в interface Accessory
- [ ] Добавить SEO хук: `useSeoSave('accessories')`
- [ ] Добавить SEO поля в editForm state
- [ ] Обновить все setEditForm вызовы (handleEdit, cancelEditing, startAdding)
- [ ] Добавить функцию handleSaveSeo
- [ ] Добавить SeoFieldsForm компонент в JSX перед кнопками

---

### 2. `/admin/landscape/page.tsx`
**Entity Type**: `landscape`

Шаги:
- [ ] Добавить импорты SeoFieldsForm и useSeoSave
- [ ] Добавить SEO поля в interface (Landscape или похожий)
- [ ] Добавить SEO хук: `useSeoSave('landscape')`
- [ ] Добавить SEO поля в editForm state
- [ ] Обновить все setEditForm вызовы
- [ ] Добавить функцию handleSaveSeo
- [ ] Добавить SeoFieldsForm компонент в JSX

---

### 3. `/admin/campaigns/page.tsx` (если существует)
**Entity Type**: `campaigns`

Шаги:
- [ ] Добавить импорты SeoFieldsForm и useSeoSave
- [ ] Добавить SEO поля в interface Campaign
- [ ] Добавить SEO хук: `useSeoSave('campaigns')`
- [ ] Добавить SEO поля в editForm state
- [ ] Обновить все setEditForm вызовы
- [ ] Добавить функцию handleSaveSeo
- [ ] Добавить SeoFieldsForm компонент в JSX

---

### 4. `/admin/blogs/page.tsx` (если существует)
**Entity Type**: `blogs`

Шаги:
- [ ] Добавить импорты SeoFieldsForm и useSeoSave
- [ ] Добавить SEO поля в interface Blog
- [ ] Добавить SEO хук: `useSeoSave('blogs')`
- [ ] Добавить SEO поля в editForm state
- [ ] Обновить все setEditForm вызовы
- [ ] Добавить функцию handleSaveSeo
- [ ] Добавить SeoFieldsForm компонент в JSX

---

## Как использовать этот чек-лист

1. Откройте файл админ страницы (например `/admin/accessories/page.tsx`)
2. Найдите в этом файле все места из чек-листа
3. Добавьте код согласно примерам из `SEO_INTEGRATION_INSTRUCTIONS.md`
4. Проверьте что нет TypeScript ошибок

## Копипейст шаблон для новой страницы

```tsx
// 1. Импорты (добавить в начало)
import { SeoFieldsForm, SeoFieldsData } from "@/components/admin/SeoFieldsForm";
import { useSeoSave } from "@/lib/hooks/use-seo-save";

// 2. Interface (добавить SEO поля)
interface MyEntity {
  // ... существующие поля ...
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
}

// 3. Компонент (добавить после других useState)
const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('entity-type');

// 4. editForm state (добавить SEO поля)
const [editForm, setEditForm] = useState({
  // ...
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  og_image: "",
});

// 5. Обновить setEditForm вызовы (3 места - handleEdit, cancelEditing, startAdding)

// 6. Добавить функцию перед последней функцией
const handleSaveSeo = async (data: SeoFieldsData) => {
  if (!editingEntity) return;
  try {
    await saveSeoFields(editingEntity.id, data);
    setSuccess('✓ SEO успешно сохранено');
    setEditForm(prev => ({ 
      ...prev, 
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords,
      og_image: data.og_image,
    }));
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    setError('Ошибка при сохранении SEO');
  }
};

// 7. Добавить в JSX перед кнопками
{editingEntity && (
  <div className="mt-8 pt-8 border-t">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">SEO Данные</h3>
    <SeoFieldsForm
      entityType="entity-type"
      categoryName="Категория"
      initialData={{
        seo_title: editForm.seo_title,
        seo_description: editForm.seo_description,
        seo_keywords: editForm.seo_keywords,
        og_image: editForm.og_image,
      }}
      onSave={handleSaveSeo}
      isLoading={seoLoading}
      error={seoError || undefined}
    />
  </div>
)}
```

## Примеры полной реализации:
- `/admin/monuments/page.tsx` ✅
- `/admin/fences/page.tsx` ✅

**Используйте их как эталон для добавления SEO в остальные страницы!**
