require('dotenv').config()
const process = require('process')
const auth = require('./servers/auth.js');

const express = require('express')
const app = express()

auth.getAuthList();

const authRoute = require('./routes/auth.js');


app.use('/', authRoute);

app.listen(process.env.PORT, (error) => {
    if (error) consol.error(error)
    else console.log(`Listening to port ${process.env.PORT} \nProcess id: ${process.pid}`)
})