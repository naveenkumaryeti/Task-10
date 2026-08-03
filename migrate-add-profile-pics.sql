USE zeptodb;

-- users.profile_pic
SET @col1 := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='zeptodb' AND TABLE_NAME='users' AND COLUMN_NAME='profile_pic');
SET @sql1 := IF(@col1=0, 'ALTER TABLE users ADD COLUMN profile_pic LONGTEXT AFTER password_hash',
  'SELECT "users.profile_pic already exists" AS status');
PREPARE s1 FROM @sql1; EXECUTE s1; DEALLOCATE PREPARE s1;

-- admin_users.profile_pic
SET @col2 := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA='zeptodb' AND TABLE_NAME='admin_users' AND COLUMN_NAME='profile_pic');
SET @sql2 := IF(@col2=0, 'ALTER TABLE admin_users ADD COLUMN profile_pic LONGTEXT AFTER password_hash',
  'SELECT "admin_users.profile_pic already exists" AS status');
PREPARE s2 FROM @sql2; EXECUTE s2; DEALLOCATE PREPARE s2;