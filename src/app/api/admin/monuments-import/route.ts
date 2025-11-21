import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import XLSX from 'xlsx';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Создает резервную копию таблицы
 */
async function backupTable(tableName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupTableName = `${tableName}_backup_${timestamp}_${Date.now()}`;
  
  await pool.query(`CREATE TABLE ${backupTableName} AS SELECT * FROM ${tableName}`);
  
  return backupTableName;
}

/**
 * Получает существующие памятники из БД для UPSERT проверки
 */
async function getExistingMonuments(tableName: string) {
  const result = await pool.query(`SELECT id, slug, name FROM ${tableName}`);
  
  const bySlug = new Map();
  const byName = new Map();
  
  result.rows.forEach((row: any) => {
    bySlug.set(row.slug.toLowerCase(), row);
    byName.set(row.name.toLowerCase(), row);
  });
  
  return { bySlug, byName };
}

/**
 * Генерирует slug из названия (транслитерация)
 */
function generateSlug(name: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
  };

  return name
    .toLowerCase()
    .replace(/[а-яё]/g, ch => translitMap[ch] || ch)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Проверяет и создает недостающие колонки в таблице
 */
async function ensureColumns(tableName: string): Promise<void> {
  const requiredColumns = [
    { name: 'description', type: 'TEXT' },
    { name: 'availability', type: 'VARCHAR(100) DEFAULT \'под заказ\'' },
    { name: 'hit', type: 'BOOLEAN DEFAULT false' },
    { name: 'popular', type: 'BOOLEAN DEFAULT false' },
    { name: 'new', type: 'BOOLEAN DEFAULT false' },
    { name: 'seo_title', type: 'VARCHAR(255)' },
    { name: 'seo_description', type: 'VARCHAR(255)' },
    { name: 'seo_keywords', type: 'VARCHAR(255)' },
    { name: 'og_image', type: 'VARCHAR(255)' },
  ];

  for (const column of requiredColumns) {
    try {
      const result = await pool.query(
        `SELECT 1 FROM information_schema.columns 
         WHERE table_name = $1 AND column_name = $2`,
        [tableName, column.name]
      );

      if (result.rows.length === 0) {
        await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.type}`);
      }
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.warn(`Warning adding column ${column.name}:`, error.message);
      }
    }
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file || !category) {
      return NextResponse.json(
        { error: 'Missing file or category' },
        { status: 400 }
      );
    }

    const tableMap: { [key: string]: string } = {
      'single': 'single_monuments',
      'double': 'double_monuments',
      'composite': 'composite_monuments',
      'exclusive': 'products',
    };

    const tableName = tableMap[category];
    if (!tableName) {
      return NextResponse.json(
        { error: `Unknown category: ${category}` },
        { status: 400 }
      );
    }

    console.log(`\n📥 Starting import for: ${category} (table: ${tableName})`);

    // Проверяем и создаем недостающие колонки
    console.log(`  🔍 Checking table structure...`);
    await ensureColumns(tableName);

    // Создаем бэкап перед импортом
    console.log(`  💾 Creating backup...`);
    const backupTableName = await backupTable(tableName);

    // Получаем существующие памятники
    console.log(`  📊 Loading existing records...`);
    const existing = await getExistingMonuments(tableName);

    // Читаем Excel файл
    console.log(`  📖 Reading Excel file...`);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer));
    
    const sheetMap: { [key: string]: string | null } = {
      'single': 'Одиночные',
      'double': 'Двойные',
      'composite': 'Составные',
      'exclusive': null, // Use first sheet
    };
    
    let sheetName = sheetMap[category];
    if (sheetName === null) {
      sheetName = workbook.SheetNames[0];
    }
    
    if (!sheetName || !workbook.SheetNames.includes(sheetName)) {
      return NextResponse.json(
        { error: `Sheet not found. Available: ${workbook.SheetNames.join(', ')}` },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'File is empty or has incorrect format' },
        { status: 400 }
      );
    }

    console.log(`  ✓ Read ${data.length} rows`);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    // Импортируем каждую строку
    console.log(`\n🔄 Processing data...`);
    for (let idx = 0; idx < data.length; idx++) {
      try {
        const row = data[idx] as any;
        const name = (row['Название'] || row['Name'] || '').toString().trim();
        
        if (!name) {
          console.log(`  ⚠️  Row ${idx + 1}: skipped (no name)`);
          continue;
        }

        const slug = generateSlug(name);
        const price = parseFloat((row['Цена'] || row['Price'] || 0).toString()) || 0;
        const oldPrice = parseFloat((row['Старая цена'] || row['Old Price'] || '').toString()) || null;
        const discount = parseFloat((row['Скидка'] || row['Discount'] || '').toString()) || null;
        const height = (row['Высота'] || row['Height'] || '').toString().trim();
        const image = (row['Изображение'] || row['Image'] || '').toString().trim();
        const description = (row['Описание'] || row['Description'] || '').toString().trim();
        const category_val = (row['Категория'] || row['Category'] || category).toString().trim();

        // UPSERT: ищем по slug, потом по name
        let existingMonument = existing.bySlug.get(slug.toLowerCase()) || 
                              existing.byName.get(name.toLowerCase());

        if (existingMonument) {
          // UPDATE
          await pool.query(
            `UPDATE ${tableName} SET 
              name = $1, price = $2, old_price = $3, discount = $4, 
              height = $5, image = $6, description = $7, category = $8
            WHERE id = $9`,
            [name, price, oldPrice, discount, height, image, description, category_val, existingMonument.id]
          );
          updated++;
          console.log(`  📝 Row ${idx + 1}: UPDATED "${name}"`);
        } else {
          // INSERT
          await pool.query(
            `INSERT INTO ${tableName} (slug, name, price, old_price, discount, height, image, description, category, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [slug, name, price, oldPrice, discount, height, image, description, category_val]
          );
          created++;
          console.log(`  ✨ Row ${idx + 1}: CREATED "${name}"`);
        }
      } catch (rowError: any) {
        const rowName = (data[idx] as any)['Название'] || (data[idx] as any)['Name'] || `(row ${idx + 1})`;
        errors.push(`Row ${idx + 1} "${rowName}": ${rowError.message}`);
        console.error(`  ❌ Row error:`, rowError.message);
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`  📊 Total: ${created + updated} | Created: ${created} | Updated: ${updated}`);
    console.log(`  💾 Backup: ${backupTableName}`);

    return NextResponse.json({
      success: true,
      data: {
        backupTableName,
        tableName,
        totalProcessed: created + updated,
        created,
        updated,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

  } catch (error: any) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
