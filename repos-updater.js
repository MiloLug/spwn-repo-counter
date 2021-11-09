const fetch = require('node-fetch');
const sleep = require('await-sleep');
const db = require('./db.js');
const utils = require('./utils.js');

const { GITHUB_TOKEN } = require('./config.json');


async function getFilesPage(page, q='') {
    const queryString = `https://api.github.com/search/code?page=${page}&per_page=100&q=${encodeURIComponent(q)}`;
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
    let offset = 0;
    let emptyCount = 0;
    let errorsCount = 0;
    let flip = 0;
    
    while(true) {
        if(emptyCount > 2 || p > 10 || errorsCount > 4){
            if(offset > 51)
                break;
            
            p = 1;
            offset++;
            emptyCount = 0;
            errorsCount = 0;
            continue;
        }
        
        await sleep(5000 + errorsCount*20000); // to avoid rate-limiting
        
        try{
            const response = await getFilesPage(
                p,
                'extension:spwn'
                + ' size:' + (offset > 50 ? '>=500' : offset*10 + '..' + (offset+1)*10)
                + 'sort:updated-' + ['asc', 'desc'][flip % 2]
            );
            if(!response?.items?.length) {
                emptyCount++;
                continue;
            }
            
            for(const file of response.items) {
                if(!repos[file.repository.id]) {
                    repos[file.repository.id] = file.repository;
                }
            }
            
            errorsCount = 0;
            emptyCount = 0;
            flip++;
            
            if(flip > 1){
                flip = 0;
                p++;
            }
        }
        catch(e){
            errorsCount++;
        }
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

