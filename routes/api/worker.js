const express = require('express');
const router = express.Router();
const knexBuilder = require('../../services/connection/knex');
const resHelper = require('../../services/response/helper');

router.post('/sms', (req, res) => {
  knexBuilder.getConnection().then(() => {
    res.json(
      resHelper.getJson({
        message: 'ok'
      })
    );
  });
});

module.exports = router;