USE zeptodb;

-- Add image_url column if it doesn't already exist (safe to re-run)
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'zeptodb'
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image_url'
);

SET @sql := IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN image_url LONGTEXT AFTER stock',
  'SELECT "image_url already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;