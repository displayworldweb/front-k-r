# Интеграция SEO в админ страницы

## ГОТОВО ✅
- ✅ Памятники (`/admin/monuments/page.tsx`) - **полностью настроено**
- ✅ Ограды (`/admin/fences/page.tsx`) - **полностью настроено**

## ШАБЛОН для остальных типов (Accessories, Landscape, Campaigns, Blogs)

### 1. Добавить импорты в начало файла:
```tsx
import { SeoFieldsForm, SeoFieldsData } from "@/components/admin/SeoFieldsForm";
import { useSeoSave } from "@/lib/hooks/use-seo-save";
```

### 2. Добавить SEO поля в Interface элемента:
```tsx
interface YourEntity {
  // ... существующие поля ...
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
}
```

### 3. Добавить SEO хук в компонент (после других useState):
```tsx
// Для accessories
const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('accessories');

// Для landscape
const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('landscape');

// Для campaigns
const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('campaigns');

// Для blogs
const { saveSeoFields, isLoading: seoLoading, error: seoError } = useSeoSave('blogs');
```

### 4. Добавить SEO поля в editForm state:
```tsx
const [editForm, setEditForm] = useState({
  // ... существующие поля ...
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  og_image: "",
});
```

### 5. Обновить все места где вызывается setEditForm (обычно 3 места):
- В handleEdit/открытии формы редактирования
- В cancelEditing
- В startAdding

Добавить SEO поля:
```tsx
seo_title: entity.seo_title || "",
seo_description: entity.seo_description || "",
seo_keywords: entity.seo_keywords || "",
og_image: entity.og_image || "",
```

### 6. Добавить функцию handleSaveSeo (перед последней функцией удаления):
```tsx
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
```

### 7. Добавить SeoFieldsForm в JSX (перед кнопками Отмена/Сохранить):
```tsx
{editingEntity && (
  <div className="mt-8 pt-8 border-t">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">SEO Данные</h3>
    <SeoFieldsForm
      entityType="accessories"  // или "landscape", "campaigns", "blogs"
      categoryName="Аксессуары"  // или нужное название
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

## Entity Types для useSeoSave():
- `'single-monuments'` - Одиночные памятники
- `'double-monuments'` - Двойные памятники
- `'cheap-monuments'` - Недорогие памятники
- `'cross-monuments'` - Памятники в виде креста
- `'heart-monuments'` - Памятники в виде сердца
- `'composite-monuments'` - Составные памятники
- `'europe-monuments'` - Европейские памятники
- `'artistic-monuments'` - Художественная резка
- `'tree-monuments'` - Памятники в виде деревьев
- `'complex-monuments'` - Мемориальные комплексы
- `'fences'` - Ограды
- `'accessories'` - Аксессуары
- `'landscape'` - Благоустройство (Искусственный газон)
- `'campaigns'` - Акции
- `'blogs'` - Блог

## Как это работает:

1. **SeoFieldsForm** - компонент формы с 4 полями (title, description, keywords, og_image)
2. **useSeoSave** - хук который отправляет данные на backend при `onSave`
3. **Backend route** `/api/admin/{entityType}/{entityId}/seo` - сохраняет в БД
4. **Иерархия при отображении на сайте**:
   - Если у сущности есть SEO данные → используются они
   - Если пусто → используется шаблон категории
   - Если и шаблона нет → используется имя сущности по умолчанию

## Примеры уже реализованные:
- `/admin/monuments/page.tsx` - полная интеграция
- `/admin/fences/page.tsx` - полная интеграция

Остальные страницы следуют этому же шаблону!

