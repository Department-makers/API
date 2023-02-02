const process = require('process');
const fs = require('fs');
const path = require('path');

const config = require('../config/config.js');

var authList = [];

const getAuthList = () => {
    authList = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "auth_list.json")));
}

const checkAuth = (request) => {
    if(typeof request != "string")
        return false;
    
    let parsed_request = request.split(' ');

    let entered = false;

    authList.forEach(el => {
        if(el.login == parsed_request[0]) {
            if(el.password == config.get_auth_hash(parsed_request[1]))
                entered = true;
            return;
        }
    });

    return entered;
}

module.exports = {
    getAuthList: getAuthList,
    checkAuth: checkAuth
};