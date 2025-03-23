require('dotenv').config();
const { 
    Bot, 
    InlineKeyboard, 
    Keyboard, 
    GrammyError, 
    HttpError 
} = require('grammy');

const { getRandomQuestion } = require('./utils');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
    const startKeyboard = new Keyboard()
    .text('HTML')
    .text('CSS')
    .row()
    .text('JavaScript')
    .text('React')
    .resized();

    await ctx.reply(
        'Привет. Я твой бот! \nОтветил на команду start.'
    );

    await ctx.reply('Выбери тему вопроса в меню', {
        reply_markup: startKeyboard
    })
});

bot.hears(['HTML', 'CSS', 'JavaScript', 'React'], async (ctx) => {
    const topic = ctx.message.text;
    const question = getRandomQuestion(topic);

    let inlineKeyboard;

    if (question.hasOptions) {
        const buttonRows = question.options.map((option) => [
            InlineKeyboard.text(
                option.text, 
                JSON.stringify({
                type: `${topic}-option`,
                isCorrect: option.isCorrect,
                questionId: question.id,
            }),
        ),
    ]);

        inlineKeyboard = InlineKeyboard.from(buttonRows); 
    } else {
        inlineKeyboard = new InlineKeyboard().text(
            'Узнать ответ', JSON.stringify({
            type: ctx.message.text,
            questionId: question.id,
        }))
    }
    
    await ctx.reply(question.text, {
        reply_markup: inlineKeyboard
    })
});

bot.on('callback_query:data', async (ctx) => {
    if (ctx.callbackQuery.data === 'Cancel') {
        await ctx.reply('Отменено')
        await ctx.answerCallbackQuery();
        return;
    }

    const callbackData = JSON.parse(ctx.callbackQuery.data);
    await ctx.reply(`${callbackData.type} - составляющая фронтенда`)
    await ctx.answerCallbackQuery();    
})

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

bot.start();
