-- Auto-generated to stay in sync with frontend demo catalog
CREATE DATABASE IF NOT EXISTS zeptodb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zeptodb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_pic LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_pic LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🛒'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  weight VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(255),
  phone VARCHAR(20),
  delivery_address VARCHAR(500),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'UPI',
  payment_status VARCHAR(20) DEFAULT 'PENDING',
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed: categories
INSERT IGNORE INTO categories (id, name, emoji) VALUES (1, 'Fruits & Vegetables', '🥦');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (2, 'Dairy & Breakfast', '🥛');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (3, 'Munchies', '🍿');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (4, 'Cold Drinks & Juices', '🥤');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (5, 'Bakery & Biscuits', '🍞');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (6, 'Instant & Frozen Food', '🍕');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (7, 'Tea, Coffee & Health Drinks', '☕');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (8, 'Atta, Rice & Dal', '🌾');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (9, 'Masala, Oil & More', '🧂');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (10, 'Sweet Tooth', '🍫');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (11, 'Personal Care', '🧴');
INSERT IGNORE INTO categories (id, name, emoji) VALUES (12, 'Home & Cleaning', '🧹');

-- Seed: products
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (1, 1, 'Fresh Banana', '6 pcs', 49, 60, 120, 'https://loremflickr.com/300/300/banana,food?lock=1');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (2, 1, 'Alphonso Mango', '1 kg', 199, 240, 40, 'https://loremflickr.com/300/300/mango,food?lock=2');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (3, 1, 'Tomato Hybrid', '500 g', 22, 28, 200, 'https://loremflickr.com/300/300/tomato,food?lock=3');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (4, 1, 'Onion', '1 kg', 32, 38, 300, 'https://loremflickr.com/300/300/onion,food?lock=4');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (5, 1, 'Potato', '1 kg', 28, 34, 300, 'https://loremflickr.com/300/300/potato,food?lock=5');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (6, 1, 'Coriander Leaves', '100 g', 12, 15, 90, 'https://loremflickr.com/300/300/cilantro,food?lock=6');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (7, 2, 'Amul Milk', '500 ml', 27, 27, 150, 'https://loremflickr.com/300/300/milk,food?lock=7');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (8, 2, 'Farm Eggs', '12 pcs', 84, 96, 100, 'https://loremflickr.com/300/300/eggs,food?lock=8');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (9, 2, 'Brown Bread', '400 g', 45, 50, 60, 'https://loremflickr.com/300/300/bread,food?lock=9');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (10, 2, 'Paneer', '200 g', 89, 99, 70, 'https://loremflickr.com/300/300/paneer,food?lock=10');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (11, 2, 'Butter', '100 g', 54, 58, 80, 'https://loremflickr.com/300/300/butter,food?lock=11');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (12, 2, 'Corn Flakes', '375 g', 149, 175, 55, 'https://loremflickr.com/300/300/cereal,food?lock=12');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (13, 3, 'Potato Chips Classic', '52 g', 20, 20, 200, 'https://loremflickr.com/300/300/chips,food?lock=13');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (14, 3, 'Nachos Cheese', '60 g', 45, 50, 90, 'https://loremflickr.com/300/300/nachos,food?lock=14');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (15, 3, 'Peanut Namkeen', '200 g', 40, 45, 110, 'https://loremflickr.com/300/300/namkeen,food?lock=15');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (16, 3, 'Popcorn Butter', '70 g', 35, 40, 85, 'https://loremflickr.com/300/300/popcorn,food?lock=16');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (17, 4, 'Cola Can', '300 ml', 40, 45, 130, 'https://loremflickr.com/300/300/cola,food?lock=17');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (18, 4, 'Orange Juice', '1 L', 110, 130, 60, 'https://loremflickr.com/300/300/juice,food?lock=18');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (19, 4, 'Mineral Water', '1 L', 20, 20, 250, 'https://loremflickr.com/300/300/water,food?lock=19');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (20, 4, 'Lemonade', '500 ml', 35, 40, 70, 'https://loremflickr.com/300/300/lemonade,food?lock=20');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (21, 5, 'Choco Cookies', '150 g', 55, 60, 100, 'https://loremflickr.com/300/300/cookies,food?lock=21');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (22, 5, 'Digestive Biscuits', '250 g', 45, 50, 120, 'https://loremflickr.com/300/300/biscuits,food?lock=22');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (23, 5, 'Cup Cakes', '4 pcs', 89, 99, 40, 'https://loremflickr.com/300/300/cupcake,food?lock=23');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (24, 6, 'Instant Noodles', '70 g', 14, 14, 300, 'https://loremflickr.com/300/300/noodles,food?lock=24');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (25, 6, 'Frozen Paratha', '5 pcs', 99, 110, 60, 'https://loremflickr.com/300/300/paratha,food?lock=25');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (26, 6, 'Veg Frozen Momos', '250 g', 129, 149, 55, 'https://loremflickr.com/300/300/dumplings,food?lock=26');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (27, 6, 'Frozen Pizza Base', '2 pcs', 79, 89, 45, 'https://loremflickr.com/300/300/pizza,food?lock=27');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (28, 7, 'Tea Powder', '250 g', 120, 135, 90, 'https://loremflickr.com/300/300/tea,food?lock=28');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (29, 7, 'Instant Coffee', '100 g', 195, 220, 70, 'https://loremflickr.com/300/300/coffee,food?lock=29');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (30, 7, 'Health Drink Malt', '500 g', 210, 240, 50, 'https://loremflickr.com/300/300/milkshake,food?lock=30');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (31, 8, 'Wheat Atta', '5 kg', 220, 250, 80, 'https://loremflickr.com/300/300/flour,food?lock=31');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (32, 8, 'Basmati Rice', '5 kg', 399, 450, 60, 'https://loremflickr.com/300/300/rice,food?lock=32');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (33, 8, 'Toor Dal', '1 kg', 145, 160, 90, 'https://loremflickr.com/300/300/lentils,food?lock=33');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (34, 9, 'Sunflower Oil', '1 L', 135, 150, 100, 'https://loremflickr.com/300/300/oil,food?lock=34');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (35, 9, 'Turmeric Powder', '200 g', 45, 50, 130, 'https://loremflickr.com/300/300/turmeric,food?lock=35');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (36, 9, 'Red Chilli Powder', '200 g', 55, 60, 110, 'https://loremflickr.com/300/300/chili,food?lock=36');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (37, 10, 'Dark Chocolate Bar', '80 g', 99, 110, 100, 'https://loremflickr.com/300/300/chocolate,food?lock=37');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (38, 10, 'Gulab Jamun Tin', '1 kg', 175, 199, 40, 'https://loremflickr.com/300/300/sweets,food?lock=38');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (39, 10, 'Ice Cream Tub', '700 ml', 210, 240, 35, 'https://loremflickr.com/300/300/icecream,food?lock=39');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (40, 11, 'Face Wash', '100 ml', 149, 175, 70, 'https://loremflickr.com/300/300/skincare,food?lock=40');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (41, 11, 'Shampoo', '180 ml', 189, 210, 65, 'https://loremflickr.com/300/300/shampoo,food?lock=41');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (42, 11, 'Toothpaste', '150 g', 89, 99, 120, 'https://loremflickr.com/300/300/toothpaste,food?lock=42');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (43, 12, 'Dishwash Liquid', '500 ml', 99, 110, 90, 'https://loremflickr.com/300/300/dishsoap,food?lock=43');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (44, 12, 'Floor Cleaner', '1 L', 125, 140, 75, 'https://loremflickr.com/300/300/cleaning,food?lock=44');
INSERT IGNORE INTO products (id, category_id, name, weight, price, mrp, stock, image_url) VALUES (45, 12, 'Laundry Detergent', '1 kg', 175, 199, 60, 'https://loremflickr.com/300/300/detergent,food?lock=45');

-- Seed: default admin account
-- email: admin@quikkart.com   password: Admin@123
INSERT IGNORE INTO admin_users (id, name, email, password_hash) VALUES
  (1, 'Platform Admin', 'admin@quikkart.com', '$2b$10$2jgL83LcJhKX2dvAwVOXNOzq4hrfFwv3tkqIvevdMICibrmt4Ywzi');
