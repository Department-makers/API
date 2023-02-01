const process = require('process');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');

var authList = [];

const getAuthList = () => {
    authList = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "auth_list.json")));
}

const checkAuth = (request) => {
    if(typeof request != "string")
        return false;
    
    let parsed_request = request.split(' ');

    console.log({login: parsed_request[0], password: md5(parsed_request[1] + "I_10ve_@pp!e")})

    let entered = false;

    authList.forEach(el => {
        if(el.login == parsed_request[0]) {
            if(el.password == md5(parsed_request[1] + "I_10ve_@pp!e"))
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