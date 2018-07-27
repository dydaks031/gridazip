module.exports = function() {
  return function changeToCoKr(req, res, next) {
    if (req.headers.host.indexOf('gridazip.com') > -1 ) {
      return res.redirect(`http://${req.headers.host.replace('gridazip.com', 'gridazip.co.kr')}/${req.url}`);
    }
    else {
      next();
    }
  };
};