import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    const telegramId = ctx.from.id.toString();
    const name = ctx.from.first_name || 'User';
    
    // First user becomes ADMIN automatically
    const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const isFirstUser = userCountStmt.count === 0;

    const existingUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
    if (!existingUser) {
        db.prepare('INSERT INTO users (telegram_id, name, role) VALUES (?, ?, ?)').run(
            telegramId, 
            name, 
            isFirstUser ? 'ADMIN' : 'CLIENT'
        );
        ctx.reply('Добро пожаловать в службу доставки цветов! Мы рады видеть вас.', {
            reply_markup: {
                inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url: process.env.WEB_APP_URL || 'https://t.me/bothost' } }]]
            }
        });
    } else {
        ctx.reply(`С возвращением, ${name}!`, {
            reply_markup: {
                inline_keyboard: [[{ text: 'Открыть магазин', web_app: { url: process.env.WEB_APP_URL || 'https://t.me/bothost' } }]]
            }
        });
    }
});

// Helpers for notifications
export const notifyAdmins = (message) => {
    const admins = db.prepare("SELECT telegram_id FROM users WHERE role = 'ADMIN'").all();
    admins.forEach(admin => {
        bot.telegram.sendMessage(admin.telegram_id, message).catch(console.error);
    });
};

export const notifyCouriers = (message) => {
    const couriers = db.prepare("SELECT telegram_id FROM users WHERE role = 'COURIER'").all();
    couriers.forEach(courier => {
        bot.telegram.sendMessage(courier.telegram_id, message).catch(console.error);
    });
};

export const notifyClient = (telegramId, message) => {
    bot.telegram.sendMessage(telegramId, message).catch(console.error);
};

export default bot;
