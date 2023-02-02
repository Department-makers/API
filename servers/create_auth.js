const process = require('process');
const fs = require('fs');
const path = require('path');

const config = require('../config/config.js');

{
    let authList = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "auth_list.json")));

    console.log({
        login: process.env.npm_config_login,
        password: process.env.npm_config_password
    });

    authList.push({
        login: process.env.npm_config_login,
        password: config.get_auth_hash(process.env.npm_config_password)
    });

    fs.writeFileSync(path.join(__dirname, '..', 'config', 'auth_list.json'), JSON.stringify(authList));
}