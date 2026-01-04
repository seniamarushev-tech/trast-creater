import { Telegraf } from 'telegraf';
import axios from 'axios';

const token = process.env.BOT_TOKEN || 'BOT_TOKEN_MISSING';
const apiBase = process.env.API_BASE || 'http://localhost:3001';

const bot = new Telegraf(token);

bot.start(async (ctx) => {
  ctx.reply('Добро пожаловать в TRUST CrEATER! Используйте /trust чтобы открыть мини-приложение.');
});

bot.command('trust', (ctx) => {
  ctx.reply('Открыть mini app: https://t.me/your_bot/miniapp');
});

bot.command('verify', (ctx) => {
  ctx.reply('Верификация артиста в MVP делается через админов.');
});

bot.command('onboard', async (ctx) => {
  const tgId = String(ctx.from?.id ?? '');
  try {
    const { data } = await axios.post(`${apiBase}/users/onboard`, { tgId });
    ctx.reply(`Оплачено 250 Stars (mock). TRUST активен до ${data.expiresAt}.`);
  } catch (err) {
    ctx.reply('Не удалось активировать доступ.');
  }
});

bot.launch();
console.log('Bot started');
