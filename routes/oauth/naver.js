const express = require('express');
const router = express.Router();
const global = require('../../services/app/global');

router.get('/', (req, res) => {
  // let redirectURI = 'http://localhost:3001/oauth/naver';
  let code = req.query.code;
  let state = req.query.state;
  let api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' + global.auth.naver.key + '&client_secret=' + global.auth.naver.secret + '&code=' + code + '&state=' + state;
  let request = require('request');
  let options = {
    url: api_url,
    headers: { 'X-Naver-Client-Id': global.auth.naver.key, 'X-Naver-Client-Secret': global.auth.naver.secret }
  };

  request.get(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.render('pages/oauth/naver', {
        data: body
      });
    }
    else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  });
});

module.exports = router;