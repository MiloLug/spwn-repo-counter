const { Pool, Client } = require('pg');
const client = new Client();

const { DATABASE } = require('./config.json');


const pool = new Pool(DATABASE);

module.exports = {
    async getAllRepos(fields=['*']) {
        return (await pool.query(`SELECT ${fields.join(', ')} FROM repo`))?.rows || [];
    },
    async getReposCount() {
        return (await pool.query(`SELECT COUNT(id) as c FROM repo`)).rows[0]["c"] || 0;
    },

    async addRepos(repos) {
        const matches = repos.map(
            (repo, i) => (i *= 4, `($${i+1}, $${i+2}, $${i+3}, $${i+4})`)
        ).join(',');
        const values = repos.reduce((acc, repo) => {
            acc.push(repo.id, repo.url, repo.description, repo.name);
            return acc;
        }, []);
        
        return pool.query(`INSERT INTO repo (id, url, description, name) VALUES ${matches}`, values);
    }
}

process.on('SIGTERM', () => {
    pool.end();
});

