module.exports = {
    reposListMessages(repos, title="") {
        let msgs = [];
        let msg = {
            title: title || "",
            description: ""
        };
        
        for(let i = 0; i < repos.length; i++) {
            for(; (repo = repos[i]) && msg.description.length < 1900; i++) {
                msg.description += `**[${repo.name}](${repo.url})** \n${repo.description || '~ no description ~'}\n\n`;
            }
            msgs.push({
                embed: msg
            });
            msg = {description: ""};
        }

        return msgs;
    },

    reposCountMessage(count) {
        return {
            embed: {
                title: `SPWN is now used in ${count} repos!`
            }
        };
    },

    async sendToChannelName(guild, channelName, msgs) {
        const channel = guild.channels.find(channel => channel.name === channelName);
        if(!channel) return;
        for(const msg of msgs)
            await channel.createMessage(msg);
    },

};
