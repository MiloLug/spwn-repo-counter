const { UPDATE_INTERVAL } = require('./config.json');

const startLoop = require('./loop.js');
const createReposUpdater = require('./repos-updater.js');
const utils = require('./utils.js');
const db = require('./db.js');


module.exports = bot => {
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


    bot.on('guildCreate', async guild => {
        let msgs = utils.reposListMessages(await db.getAllRepos(), "Repositories:");
        if(!msgs.length)
            return;
        msgs.push(utils.reposCountMessage(await db.getReposCount()));

        utils.sendToChannelName(guild, 'spwn-repos', msgs);
    });


    bot.on('error', err => {
      console.warn(err);
    });
}
