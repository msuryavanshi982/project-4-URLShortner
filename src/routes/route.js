const express = require('express')
const router = express.Router()
const urlController = require('../controllers/urlController');

//============================post api for shorten url===================>>>
router.post('/url/shorten',urlController.shortUrl);

//============================get api for redirect url===================>>>
router.get('/:urlCode',urlController.getUrl);


module.exports = router