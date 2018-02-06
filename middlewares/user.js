const MiddleWare = () => {
  return (req, res, next) => {
    var session = req.session;

    if (typeof session !== 'undefined' && typeof session.user !== 'undefined' && session.user !== null) {
      req.user = session.user;
    }
    else {
      req.user = null;
    }

    res.locals.user = req.user;

    next();
  };
};

module.exports = MiddleWare;