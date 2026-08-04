// Fallback catalog data — used only if the backend API is unreachable,
// so the UI is still fully browsable in a static/offline preview.
// The same categories & products are seeded into MySQL via
// application/database/init.sql, so IDs line up with the real backend.

const DEMO_CATEGORIES = [
  { id: 1, name: "Fruits & Vegetables", emoji: "🥦" },
  { id: 2, name: "Dairy & Breakfast", emoji: "🥛" },
  { id: 3, name: "Munchies", emoji: "🍿" },
  { id: 4, name: "Cold Drinks & Juices", emoji: "🥤" },
  { id: 5, name: "Bakery & Biscuits", emoji: "🍞" },
  { id: 6, name: "Instant & Frozen Food", emoji: "🍕" },
  { id: 7, name: "Tea, Coffee & Health Drinks", emoji: "☕" },
  { id: 8, name: "Atta, Rice & Dal", emoji: "🌾" },
  { id: 9, name: "Masala, Oil & More", emoji: "🧂" },
  { id: 10, name: "Sweet Tooth", emoji: "🍫" },
  { id: 11, name: "Personal Care", emoji: "🧴" },
  { id: 12, name: "Home & Cleaning", emoji: "🧹" },
];

function img(keyword) {
  // LoremFlickr returns a real photo tagged with the given keyword, so
  // "banana" shows an actual banana instead of a random unrelated photo.
  // ",food" narrows results toward food/grocery photography specifically.
  return `https://loremflickr.com/300/300/${encodeURIComponent(keyword)},food?lock=${hashSeed(keyword)}`;
}
function hashSeed(str) {
  // Deterministic small integer per keyword so the SAME product always
  // gets the SAME photo on every page load (LoremFlickr's `lock` param).
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 1000;
}

const DEMO_PRODUCTS = [
  // Fruits & Vegetables
  { id: 1, category_id: 1, name: "Fresh Banana", weight: "6 pcs", price: 49, mrp: 60, stock: 120, image_url: img("banana") },
  { id: 2, category_id: 1, name: "Alphonso Mango", weight: "1 kg", price: 199, mrp: 240, stock: 40, image_url: img("mango") },
  { id: 3, category_id: 1, name: "Tomato Hybrid", weight: "500 g", price: 22, mrp: 28, stock: 200, image_url: img("tomato") },
  { id: 4, category_id: 1, name: "Onion", weight: "1 kg", price: 32, mrp: 38, stock: 300, image_url: img("onion") },
  { id: 5, category_id: 1, name: "Potato", weight: "1 kg", price: 28, mrp: 34, stock: 300, image_url: img("potato") },
  { id: 6, category_id: 1, name: "Coriander Leaves", weight: "100 g", price: 12, mrp: 15, stock: 90, image_url: img("cilantro") },

  // Dairy & Breakfast
  { id: 7, category_id: 2, name: "Amul Milk", weight: "500 ml", price: 27, mrp: 27, stock: 150, image_url: img("milk") },
  { id: 8, category_id: 2, name: "Farm Eggs", weight: "12 pcs", price: 84, mrp: 96, stock: 100, image_url: img("eggs") },
  { id: 9, category_id: 2, name: "Brown Bread", weight: "400 g", price: 45, mrp: 50, stock: 60, image_url: img("bread") },
  { id: 10, category_id: 2, name: "Paneer", weight: "200 g", price: 89, mrp: 99, stock: 70, image_url: img("paneer") },
  { id: 11, category_id: 2, name: "Butter", weight: "100 g", price: 54, mrp: 58, stock: 80, image_url: img("butter") },
  { id: 12, category_id: 2, name: "Corn Flakes", weight: "375 g", price: 149, mrp: 175, stock: 55, image_url: img("cereal") },

  // Munchies
  { id: 13, category_id: 3, name: "Potato Chips Classic", weight: "52 g", price: 20, mrp: 20, stock: 200, image_url: img("chips") },
  { id: 14, category_id: 3, name: "Nachos Cheese", weight: "60 g", price: 45, mrp: 50, stock: 90, image_url: img("nachos") },
  { id: 15, category_id: 3, name: "Peanut Namkeen", weight: "200 g", price: 40, mrp: 45, stock: 110, image_url: img("namkeen") },
  { id: 16, category_id: 3, name: "Popcorn Butter", weight: "70 g", price: 35, mrp: 40, stock: 85, image_url: img("popcorn") },

  // Cold Drinks & Juices
  { id: 17, category_id: 4, name: "Cola Can", weight: "300 ml", price: 40, mrp: 45, stock: 130, image_url: img("cola") },
  { id: 18, category_id: 4, name: "Orange Juice", weight: "1 L", price: 110, mrp: 130, stock: 60, image_url: img("juice") },
  { id: 19, category_id: 4, name: "Mineral Water", weight: "1 L", price: 20, mrp: 20, stock: 250, image_url: img("water") },
  { id: 20, category_id: 4, name: "Lemonade", weight: "500 ml", price: 35, mrp: 40, stock: 70, image_url: img("lemonade") },

  // Bakery & Biscuits
  { id: 21, category_id: 5, name: "Choco Cookies", weight: "150 g", price: 55, mrp: 60, stock: 100, image_url: img("cookies") },
  { id: 22, category_id: 5, name: "Digestive Biscuits", weight: "250 g", price: 45, mrp: 50, stock: 120, image_url: img("biscuits") },
  { id: 23, category_id: 5, name: "Cup Cakes", weight: "4 pcs", price: 89, mrp: 99, stock: 40, image_url: img("cupcake") },

  // Instant & Frozen Food
  { id: 24, category_id: 6, name: "Instant Noodles", weight: "70 g", price: 14, mrp: 14, stock: 300, image_url: img("noodles") },
  { id: 25, category_id: 6, name: "Frozen Paratha", weight: "5 pcs", price: 99, mrp: 110, stock: 60, image_url: img("paratha") },
  { id: 26, category_id: 6, name: "Veg Frozen Momos", weight: "250 g", price: 129, mrp: 149, stock: 55, image_url: img("dumplings") },
  { id: 27, category_id: 6, name: "Frozen Pizza Base", weight: "2 pcs", price: 79, mrp: 89, stock: 45, image_url: img("pizza") },

  // Tea, Coffee & Health Drinks
  { id: 28, category_id: 7, name: "Tea Powder", weight: "250 g", price: 120, mrp: 135, stock: 90, image_url: img("tea") },
  { id: 29, category_id: 7, name: "Instant Coffee", weight: "100 g", price: 195, mrp: 220, stock: 70, image_url: img("coffee") },
  { id: 30, category_id: 7, name: "Health Drink Malt", weight: "500 g", price: 210, mrp: 240, stock: 50, image_url: img("milkshake") },

  // Atta, Rice & Dal
  { id: 31, category_id: 8, name: "Wheat Atta", weight: "5 kg", price: 220, mrp: 250, stock: 80, image_url: img("flour") },
  { id: 32, category_id: 8, name: "Basmati Rice", weight: "5 kg", price: 399, mrp: 450, stock: 60, image_url: img("rice") },
  { id: 33, category_id: 8, name: "Toor Dal", weight: "1 kg", price: 145, mrp: 160, stock: 90, image_url: img("lentils") },

  // Masala, Oil & More
  { id: 34, category_id: 9, name: "Sunflower Oil", weight: "1 L", price: 135, mrp: 150, stock: 100, image_url: img("oil") },
  { id: 35, category_id: 9, name: "Turmeric Powder", weight: "200 g", price: 45, mrp: 50, stock: 130, image_url: img("turmeric") },
  { id: 36, category_id: 9, name: "Red Chilli Powder", weight: "200 g", price: 55, mrp: 60, stock: 110, image_url: img("chili") },

  // Sweet Tooth
  { id: 37, category_id: 10, name: "Dark Chocolate Bar", weight: "80 g", price: 99, mrp: 110, stock: 100, image_url: img("chocolate") },
  { id: 38, category_id: 10, name: "Gulab Jamun Tin", weight: "1 kg", price: 175, mrp: 199, stock: 40, image_url: img("sweets") },
  { id: 39, category_id: 10, name: "Ice Cream Tub", weight: "700 ml", price: 210, mrp: 240, stock: 35, image_url: img("icecream") },

  // Personal Care
  { id: 40, category_id: 11, name: "Face Wash", weight: "100 ml", price: 149, mrp: 175, stock: 70, image_url: img("skincare") },
  { id: 41, category_id: 11, name: "Shampoo", weight: "180 ml", price: 189, mrp: 210, stock: 65, image_url: img("shampoo") },
  { id: 42, category_id: 11, name: "Toothpaste", weight: "150 g", price: 89, mrp: 99, stock: 120, image_url: img("toothpaste") },

  // Home & Cleaning
  { id: 43, category_id: 12, name: "Dishwash Liquid", weight: "500 ml", price: 99, mrp: 110, stock: 90, image_url: img("dishsoap") },
  { id: 44, category_id: 12, name: "Floor Cleaner", weight: "1 L", price: 125, mrp: 140, stock: 75, image_url: img("cleaning") },
  { id: 45, category_id: 12, name: "Laundry Detergent", weight: "1 kg", price: 175, mrp: 199, stock: 60, image_url: img("detergent") },
];

function getCategoryEmoji(id) {
  const c = DEMO_CATEGORIES.find((c) => c.id === Number(id));
  return c ? c.emoji : "🛒";
}
