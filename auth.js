const jwt = require('jsonwebtoken')

//model is optional

const auth = (req, res, next) =>{
    console.log(req.cookies);
    const token =req.cookies.token|| req.body.token || req.header('Authorization').replace('Bearer ', ''); 

   if(!token){
      return res.status(403).send("token is missing")
   }

   try {
    const decode = jwt.verify(token, process.env.SECRET_KEY)
    console.log(decode);
    req.user = decode
    //bring in info from DB
     
    // Set a cookie with an expiration time (e.g., 1 hour)
     res.cookie('token', token, { maxAge: 3600000 }); // 3600000 milliseconds = 1/2 hour
   } catch (error) {
    return res.status(401).send('Invalid Token')
   }
   return next();
};

module.exports = auth;