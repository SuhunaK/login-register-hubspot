require('dotenv').config();
const express = require('express')
const axios = require('axios');
const path=require('path')
const hbs=require('hbs')
const app = express()
const PORT = process.env.PORT;
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.__express)
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}));
app.use('/', require('./routes/index.js'));
app.listen(PORT)
console.log("Server running...")