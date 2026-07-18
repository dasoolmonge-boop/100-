import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import bot, { notifyAdmins, notifyCouriers, notifyClient } from './bot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building frontend (React/Vite) before starting server...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Frontend built successfully!');
} catch (error) {
  console.error('Failed to build frontend:', error);
}

const app = express();
app.use(cors());
app.use(express.json());

// Helper middleware to validate initData (simplified for now, ideally use @twa-dev/utils)
app.use((req, res, next) => {
    // We will extract telegram_id from headers for simple auth
    const tgId = req.headers['x-telegram-id'];
    if (tgId) {
        const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(tgId);
        req.user = user;
    }
    next();
});

// --- CLIENT API ---

// Get public bouquets
app.get('/api/bouquets', (req, res) => {
    const bouquets = db.prepare('SELECT * FROM bouquets WHERE is_hidden = 0').all();
    res.json(bouquets);
});

// Create order
app.post('/api/orders', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { items, totalPrice } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'No items' });

    const info = db.prepare('INSERT INTO orders (user_id, total_price) VALUES (?, ?)').run(req.user.id, totalPrice);
    const orderId = info.lastInsertRowid;

    const insertItem = db.prepare('INSERT INTO order_items (order_id, bouquet_id, quantity) VALUES (?, ?, ?)');
    items.forEach(item => {
        insertItem.run(orderId, item.id, item.quantity);
    });

    // Notify client
    notifyClient(req.user.telegram_id, `Ваш заказ #${orderId} на сумму ${totalPrice} ₽ успешно оформлен! Ожидайте доставки.`);
    
    // Notify admins
    notifyAdmins(`Новый заказ #${orderId} от ${req.user.name} на сумму ${totalPrice} ₽`);

    res.json({ success: true, orderId });
});

// --- ADMIN API ---
const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
};

app.get('/api/admin/bouquets', checkAdmin, (req, res) => {
    res.json(db.prepare('SELECT * FROM bouquets').all());
});

app.post('/api/admin/bouquets', checkAdmin, (req, res) => {
    const { name, description, price, discount_price, image_url, is_hidden } = req.body;
    db.prepare('INSERT INTO bouquets (name, description, price, discount_price, image_url, is_hidden) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name, description, price, discount_price, image_url, is_hidden ? 1 : 0);
    res.json({ success: true });
});

app.put('/api/admin/bouquets/:id', checkAdmin, (req, res) => {
    const { name, description, price, discount_price, image_url, is_hidden } = req.body;
    db.prepare('UPDATE bouquets SET name=?, description=?, price=?, discount_price=?, image_url=?, is_hidden=? WHERE id=?')
      .run(name, description, price, discount_price, image_url, is_hidden ? 1 : 0, req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/bouquets/:id', checkAdmin, (req, res) => {
    db.prepare('DELETE FROM bouquets WHERE id=?').run(req.params.id);
    res.json({ success: true });
});

app.get('/api/admin/users', checkAdmin, (req, res) => {
    res.json(db.prepare('SELECT * FROM users').all());
});

app.put('/api/admin/users/:id/role', checkAdmin, (req, res) => {
    const { role } = req.body; // 'ADMIN', 'COURIER', 'CLIENT'
    db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
    res.json({ success: true });
});

app.get('/api/admin/orders', checkAdmin, (req, res) => {
    const orders = db.prepare(`
        SELECT o.*, u.name as client_name, c.name as courier_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        LEFT JOIN users c ON o.courier_id = c.id
        ORDER BY o.created_at DESC
    `).all();
    res.json(orders);
});

app.put('/api/admin/orders/:id/status', checkAdmin, (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, orderId);
    
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(order.user_id);
    
    if (status === 'DELIVERING') {
        notifyClient(user.telegram_id, `Ваш заказ #${orderId} передан курьеру и скоро будет у вас!`);
        notifyCouriers(`Заказ #${orderId} готов к доставке.`);
    } else if (status === 'COMPLETED') {
        notifyClient(user.telegram_id, `Ваш заказ #${orderId} доставлен. Спасибо, что выбрали нас!`);
    }
    
    res.json({ success: true });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        res.send("Frontend not built yet. Run 'npm run build'");
    }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    bot.launch().then(() => {
        console.log('Telegram bot started');
    }).catch(console.error);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
