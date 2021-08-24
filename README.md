# spwn repo counter



## Setup
1. Create postgres DB
2. Import sql
```cmd
sudo -u postgres psql <db-name> < schema.sql
```
3. Create config.json
```json
{
    "BOT_TOKEN": "",
    "GITHUB_TOKEN": "",

    "DATABASE": {
        "user": "admin",
        "host": "localhost",
        "database": "spwn_counter",
        "password": "12345",
        "port": 5432
    },

    "UPDATE_INTERVAL": 1800000
}
```

