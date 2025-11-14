const fs = require('fs');
const path = require('path');
const { parseString } = require('xml2js');

/**
 * Скрипт для валидации sitemap.xml
 * Проверяет:
 * - Корректность XML
 * - Наличие обязательных полей
 * - Правильность URL
 * - Валидность дат
 * - Приоритеты и changefreq
 */

const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' };
    }
    if (parsed.hostname !== 'k-r.by') {
      return { valid: false, error: 'URL must be on k-r.by domain' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function validateDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  return { valid: true };
}

function validatePriority(priority) {
  const num = parseFloat(priority);
  if (isNaN(num) || num < 0 || num > 1) {
    return { valid: false, error: 'Priority must be between 0 and 1' };
  }
  return { valid: true };
}

function validateChangefreq(changefreq) {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  if (!validValues.includes(changefreq)) {
    return { valid: false, error: `Changefreq must be one of: ${validValues.join(', ')}` };
  }
  return { valid: true };
}

async function validateSitemap() {
  console.log('🔍 Validating sitemap.xml...\n');

  // Проверка существования файла
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found at:', SITEMAP_PATH);
    process.exit(1);
  }

  // Чтение файла
  const xmlContent = fs.readFileSync(SITEMAP_PATH, 'utf8');

  // Парсинг XML
  parseString(xmlContent, (err, result) => {
    if (err) {
      console.error('❌ Invalid XML format:', err.message);
      process.exit(1);
    }

    const urlset = result.urlset;
    if (!urlset || !urlset.url) {
      console.error('❌ No URLs found in sitemap');
      process.exit(1);
    }

    const urls = urlset.url;
    console.log(`✅ Found ${urls.length} URLs\n`);

    let errors = 0;
    let warnings = 0;
    const urlMap = new Map();

    // Валидация каждого URL
    urls.forEach((urlEntry, index) => {
      const loc = urlEntry.loc?.[0];
      const lastmod = urlEntry.lastmod?.[0];
      const changefreq = urlEntry.changefreq?.[0];
      const priority = urlEntry.priority?.[0];

      console.log(`\n📄 URL #${index + 1}: ${loc}`);

      // Проверка loc
      if (!loc) {
        console.error('  ❌ Missing <loc> tag');
        errors++;
      } else {
        const urlValidation = validateUrl(loc);
        if (!urlValidation.valid) {
          console.error(`  ❌ Invalid URL: ${urlValidation.error}`);
          errors++;
        }

        // Проверка дубликатов
        if (urlMap.has(loc)) {
          console.error(`  ❌ Duplicate URL (first seen at #${urlMap.get(loc)})`);
          errors++;
        } else {
          urlMap.set(loc, index + 1);
        }
      }

      // Проверка lastmod
      if (!lastmod) {
        console.warn('  ⚠️  Missing <lastmod> tag (recommended)');
        warnings++;
      } else {
        const dateValidation = validateDate(lastmod);
        if (!dateValidation.valid) {
          console.error(`  ❌ Invalid lastmod: ${dateValidation.error}`);
          errors++;
        }
      }

      // Проверка changefreq
      if (!changefreq) {
        console.warn('  ⚠️  Missing <changefreq> tag (recommended)');
        warnings++;
      } else {
        const changefreqValidation = validateChangefreq(changefreq);
        if (!changefreqValidation.valid) {
          console.error(`  ❌ Invalid changefreq: ${changefreqValidation.error}`);
          errors++;
        }
      }

      // Проверка priority
      if (!priority) {
        console.warn('  ⚠️  Missing <priority> tag (recommended)');
        warnings++;
      } else {
        const priorityValidation = validatePriority(priority);
        if (!priorityValidation.valid) {
          console.error(`  ❌ Invalid priority: ${priorityValidation.error}`);
          errors++;
        }
      }

      if (errors === 0 && warnings === 0) {
        console.log('  ✅ Valid');
      }
    });

    // Итоговый отчет
    console.log('\n' + '='.repeat(50));
    console.log('📊 Validation Summary:');
    console.log('='.repeat(50));
    console.log(`Total URLs: ${urls.length}`);
    console.log(`Errors: ${errors}`);
    console.log(`Warnings: ${warnings}`);

    // Статистика по категориям
    const categories = {
      home: 0,
      monuments: 0,
      fences: 0,
      accessories: 0,
      landscape: 0,
      services: 0,
      design: 0,
      blog: 0,
      other: 0,
    };

    urls.forEach(urlEntry => {
      const loc = urlEntry.loc?.[0];
      if (!loc) return;

      if (loc === 'https://k-r.by/') categories.home++;
      else if (loc.includes('/monuments')) categories.monuments++;
      else if (loc.includes('/fences')) categories.fences++;
      else if (loc.includes('/accessories')) categories.accessories++;
      else if (loc.includes('/landscape')) categories.landscape++;
      else if (loc.includes('/services')) categories.services++;
      else if (loc.includes('/design')) categories.design++;
      else if (loc.includes('/blog')) categories.blog++;
      else categories.other++;
    });

    console.log('\n📂 URLs by category:');
    Object.entries(categories).forEach(([key, count]) => {
      if (count > 0) {
        console.log(`  ${key}: ${count}`);
      }
    });

    if (errors > 0) {
      console.log('\n❌ Validation FAILED');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('\n⚠️  Validation passed with warnings');
      process.exit(0);
    } else {
      console.log('\n✅ Validation PASSED');
      process.exit(0);
    }
  });
}

validateSitemap();
