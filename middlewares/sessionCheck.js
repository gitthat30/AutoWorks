exports.isPrivate = (req, res, next) => {
  // Must be authenticated to go to the next function
  if (req.session.user) {
      return next()
  } 

  else {
    res.redirect('/login');
  }
};

exports.isPublic = (req, res, next) => {
  // If authenticated, go to home page
  if (req.session.user) {
    if(req.session.host)
      res.redirect('/hhome');
    else
      res.redirect('/home');
  } 

  else {
    return next();
  }
}

exports.isHost = (req, res, next) => {
  // If host, go to host page
  if (req.session.user && req.session.host) {
    return next()
  } 

  else {
    if(req.session.user)
      res.redirect('/home');
    else
      res.redirect('/login');
  }
}