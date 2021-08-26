const db = require('./db.js');

module.exports = bot => {
    bot.registerCommand("count", async (msg, args) => {
        if(!args.length)
            return `SPWN repos count: ${await db.getReposCount()}`;
        const userName = args[0];
            return `SPWN repos count for the user ${userName}: ${await db.getReposCount()}`;
    });
};
