const fetch = require('node-fetch');
const sleep = require('await-sleep');
const db = require('./db.js');

const { GITHUB_TOKEN } = require('./config.json');


async function getFilesPage(page) {
    queryString = `https://api.github.com/search/code?page=${page}&per_page=100&q=${encodeURIComponent('extension:spwn')}&access_token=${GITHUB_TOKEN}`;
    return (await fetch(queryString)).json();
}

async function getAllFiles() {
    fullList = [];
    for(let p = 1, response = await getFilesPage(1); response.items.length; response = await getFilesPage(++p)) {
        fullList.push(...response.items);
        await sleep(1000); // to avoid rate-limiting
    }
    return fullList;
}

async function getRepos() {
    const allFiles = await getAllFiles();
    let repos = {};

    for(const file of allFiles) {
        if(!repos[file.repository.id]) {
            repos[file.repository.id] = file.repository;
        }
    }

    return repos;
}


module.exports = bot => async () => {
    let repos = await getRepos();
    const dbRepos = (await db.getAllRepos(['id'])).rows;

    for(const repo of dbRepos) {
        delete repos[repo.id];
    }
    repos = Object.entries(repos).map(([id, repo]) => ({
        id: repo.id,
        url: repo.html_url,
        name: decodeURIComponent(repo.html_url.split('/').slice(-2).join('/')),
        description: repo.description,
    }));
    
    if(!repos.length)
        return;

    await db.addRepos(repos);

    let msgs = [];
    let msg = {
        title: "New repositories:",
        description: ""
    };
    
    for(let i = 0; i < repos.length; i++) {
        for(; (repo = repos[i]) && msg.description.length < 1900; i++) {
            msg.description += `**[${repo.name}](${repo.url})** \n${repo.description}\n\n`;
        }
        msgs.push({
            embed: msg
        });
        msg = {description: ""};
    }
    msgs.push({
        embed: {
            title: `SPWN is now used in ${dbRepos.length + repos.length} repos!`
        }
    });

    bot.guilds.forEach(async guild => {
        const channel = guild.channels.find(channel => channel.name === 'spwn-repos');
        for(const msg of msgs)
            await channel.createMessage(msg);
    });
};

