const express = require('express');
const route = express.Router()
const urlController = require('../controllers/urlController');

route.use('/test-me',function(req, res){
    res.send('Cool hai guys')
})


module.exports = route