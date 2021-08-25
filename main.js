const eris = require('eris');
const { BOT_TOKEN } = require('./config.json');

const bot = new eris.Client(BOT_TOKEN);

require('./events.js')(bot);

bot.connect();

