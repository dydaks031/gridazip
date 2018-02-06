const express = require('express');
const router = express.Router();
const paginationService = require('../../services/pagination/main');
const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex');
const cryptoHelper = require('../../services/crypto/helper');
const resHelper = require('../../services/response/helper');
const resModel = require('../../services/response/model');

router.post('/sms', (req, res, next) => {
    knexBuilder.getConnection().then(cur => {
        res.json(
            resHelper.getJson({
               message: 'ok' 
            })
        );
    });
});

module.exports = router;