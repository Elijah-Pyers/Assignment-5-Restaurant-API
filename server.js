// Import packages, initialize an express app, and define the port you will use



// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here
// server.js
// Tasty Bites: Express.js CRUD API with logging + validation middleware

const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   In-memory "database"
   ========================= */
let nextId = 4;
let menu = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and basil.',
    price: 12.5,
    category: 'entree',
    ingredients: ['tomato', 'mozzarella', 'basil', 'olive oil'],
    available: true
  },
  {
    id: 2,
    name: 'Tiramisu',
    description: 'Layers of espresso-soaked ladyfingers and mascarpone.',
    price: 7.0,
    category: 'dessert',
    ingredients: ['ladyfingers', 'espresso', 'mascarpone', 'cocoa'],
    available: true
  },
  {
    id: 3,
    name: 'Iced Tea',
    description: 'Freshly brewed black tea served over ice.',
    price: 3.25,
    category: 'beverage',
    ingredients: ['black tea', 'water', 'ice'],
    available: true
  }
];

/* =========================
   Built-in middleware
   ========================= */
app.use(express.json());

/* =========================
   Custom middleware #1:
   Request logging (method, URL, timestamp, and body for POST/PUT)
   ========================= */
function requestLogger(req, _res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
}
app.use(requestLogger);

/* =========================
   Validation rules (express-validator)
   (applied to POST and PUT)
   ========================= */
const allowedCategories = ['appetizer', 'entree', 'dessert', 'beverage'];

const menuValidationRules = [
  body('name')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('category')
    .isString().withMessage('Category must be a string')
    .isIn(allowedCategories).withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),
  body('ingredients')
    .isArray({ min: 1 }).withMessage('Ingredients must be an array with at least 1 item'),
  body('available')
    .optional()
    .isBoolean().withMessage('Available must be true or false')
];

/* =========================
   Custom middleware #2:
   Validation error handler + defaulting
   ========================= */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ error: 'Validation failed', messages });
  }
  // default available = true if not provided
  if (req.body.available === undefined) req.body.available = true;
  next();
}

/* =========================
   Routes
   ========================= */

// Root (helpful quickstart)
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the Tasty Bites Restaurant API',
    endpoints: {
      'GET /api/menu': 'Retrieve all menu items',
      'GET /api/menu/:id': 'Retrieve a specific menu item',
      'POST /api/menu': 'Add a new menu item',
      'PUT /api/menu/:id': 'Update an existing menu item',
      'DELETE /api/menu/:id': 'Remove a menu item'
    }
  });
});

// GET all
app.get('/api/menu', (_req, res) => {
  return res.status(200).json(menu); // 200 OK
});

// GET by id
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = menu.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' }); // 404
  return res.status(200).json(item); // 200 OK
});

// POST create
app.post('/api/menu', menuValidationRules, handleValidation, (req, res) => {
  const { name, description, price, category, ingredients, available } = req.body;
  const newItem = {
    id: nextId++,
    name,
    description,
    price: Number(price),
    category,
    ingredients,
    available
  };
  menu.push(newItem);
  return res.status(201).json(newItem); // 201 Created
});

// PUT update
app.put('/api/menu/:id', menuValidationRules, handleValidation, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = menu.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Menu item not found' }); // 404

  const { name, description, price, category, ingredients, available } = req.body;
  menu[idx] = {
    id,
    name,
    description,
    price: Number(price),
    category,
    ingredients,
    available
  };
  return res.status(200).json(menu[idx]); // 200 OK
});

// DELETE remove
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = menu.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Menu item not found' }); // 404
  const deleted = menu.splice(idx, 1)[0];
  return res.status(200).json({ message: 'Menu item deleted', item: deleted }); // 200 OK
});

/* =========================
   (Optional) centralized error handler
   ========================= */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* =========================
   Start server (guarded for testing)
   ========================= */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Tasty Bites API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
