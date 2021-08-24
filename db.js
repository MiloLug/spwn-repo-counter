const { Pool, Client } = require('pg');
const client = new Client();

const { DATABASE } = require('./config.json');


const pool = new Pool(DATABASE);

module.exports = {
    async getAllRepos(fields='*') {
        return pool.query(`SELECT ${fields.join(', ')} FROM repo`);
    },
    async addRepos(repos) {
        const matches = repos.map(
            (repo, i) => (i *= 2, `($${i+1}, $${i+2})`)
        ).join(',');
        const values = repos.reduce((acc, repo) => {
            acc.push(repo.id, repo.url);
            return acc;
        }, []);
        
        return pool.query(`INSERT INTO repo (id, url) VALUES ${matches}`, values);
    }
}

process.on('SIGTERM', () => {
    pool.end();
});

