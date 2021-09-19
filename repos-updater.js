const fetch = require('node-fetch');
const sleep = require('await-sleep');
const db = require('./db.js');
const utils = require('./utils.js');

const { GITHUB_TOKEN } = require('./config.json');


async function getFilesPage(page) {
    queryString = `https://api.github.com/search/code?page=${page}&per_page=100&q=${encodeURIComponent('extension:spwn')}`;
    return (await fetch(
        queryString, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        }
    )).json();
}

async function getAllFiles() {
    fullList = [];
    for(let p = 1, response = await getFilesPage(1); response.items.length; response = await getFilesPage(++p)) {
        fullList.push(...response.items);
        await sleep(5000); // to avoid rate-limiting
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
    const dbRepos = await db.getAllRepos(['id']);

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

    let msgs = utils.reposListMessages(repos, "New repositories:");
    msgs.push(utils.reposCountMessage(dbRepos.length + repos.length));

    bot.guilds.forEach(guild => utils.sendToChannelName(guild, "spwn-repos", msgs));
};

