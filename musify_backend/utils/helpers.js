const jwt = require('jsonwebtoken');
exports = {}

exports.getToken = async (email, user) => {
    const token = jwt.sign({identifier: user._id}, process.env.JWT_SECRET);
    
    return token;
};

exports.getUserFromToken = async (token) => {
    // console.log("Getting User from Token: ", token);
    const identifier = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('Token verification failed:', err.message);
          return null;
        } else {
        //   const identifier = decoded.identifier;
          // console.log('Identifier:', decoded.identifier);
          return decoded.identifier;
        }
      });
    return identifier;
}

module.exports = exports;