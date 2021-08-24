const eris = require('eris');
const { BOT_TOKEN, UPDATE_INTERVAL } = require('./config.json');

const startLoop = require('./loop.js');
const createReposUpdater = require('./repos-updater.js');

const bot = new eris.Client(BOT_TOKEN);

bot.on('ready', async () => {
    const updater = createReposUpdater(bot);
    startLoop(updater, UPDATE_INTERVAL);
});

bot.on('messageCreate', async (msg) => {
      const botWasMentioned = msg.mentions.find(
        mentionedUser => mentionedUser.id === bot.user.id,
    );

  if (botWasMentioned) {
    try {
      await msg.channel.createMessage('Present');
    } catch (err) {
      console.warn('Failed to respond to mention.');
      console.warn(err);
    }
  }
});

bot.on('error', err => {
  console.warn(err);
});

bot.connect();

