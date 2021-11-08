const fetch = require('node-fetch');
const sleep = require('await-sleep');
const db = require('./db.js');
const utils = require('./utils.js');

const { GITHUB_TOKEN } = require('./config.json');


async function getFilesPage(page) {
    const queryString = `https://api.github.com/search/code?page=${page}&per_page=100&q=${encodeURIComponent('extension:spwn')}`;
    return (await fetch(
        queryString, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        }
    )).json();
}


module.exports = bot => async () => {
    // repos gethering
    let repos = {};
    
    // collect the repos
    let p = 1;
    while(true) {
        try{
            const response = await getFilesPage(p);
            if(!response.items.length)
                break;
            
            for(const file of response.items) {
                if(!repos[file.repository.id]) {
                    repos[file.repository.id] = file.repository;
                }
            }
            p++;
        }
        catch(e){}
        await sleep(5000); // to avoid rate-limiting
    }
    
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

