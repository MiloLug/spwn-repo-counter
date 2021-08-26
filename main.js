const eris = require('eris');
const { BOT_TOKEN } = require('./config.json');

const bot = new eris.CommandClient(BOT_TOKEN, {}, {
    description: "The spwn repo counter bot",
    owner: "MiloLug / LiaVa",
    prefix: "@mention "
});

require('./events.js')(bot);
require('./commands.js')(bot);

bot.connect();

