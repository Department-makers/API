const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('../servers/auth.js');

router.use(bodyParser.urlencoded({ extended: false }));

router.use((req, res, next) => {
    if (req.method == "POST") {
        res.locals.accessGranted = auth.checkAuth(req.body.auth);

        if(res.locals.accessGranted)
            res.locals.request = req.body;
    }

    next();
});

router.use((req, res, next) => {
    if (req.method == "GET") {
        res.locals.accessGranted = auth.checkAuth(req.query.auth);

        if(res.locals.accessGranted)
            res.locals.request = req.query;
    }
    
    next();
});

router.use((req, res, next) => {
    if(res.locals.accessGranted == undefined) {
        res.status(405);
        res.json({error: 405});
        return;
    }

    if(res.locals.accessGranted == false) {
        res.status(401);
        res.json({error: 401});
        return;
    }

    res.locals.request.auth = undefined;
    next();    
});


module.exports = router;