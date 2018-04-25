// This is a shortcut template for scaffolding new router.

const express = require('express')
const router = express.Router()
// const paginationService = require('../../services/pagination/main');
// const filterService = require('../../services/filter/main');
const knexBuilder = require('../../services/connection/knex')
// const cryptoHelper = require('../../services/crypto/helper');
// const resHelper = require('../../services/response/helper');
// const resModel = require('../../services/response/model');

router.post('/', (req, res, next) => {
  knexBuilder.getConnection().then(cur => {
  })
})

module.exports = router
