const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    const verifyUser = jwt.verify(token, process.env.SECRET);
    console.log(verifyUser);

    const user = await Register.findOne({ _id: verifyUser._id });

    req.token = token;
    req.user = user;

    console.log(req.token);

    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

const auth2 = async (req,res,next)=>{
  console.log(req.role)
  // req.role= "admin"
  next();
}


module.exports = auth2;
module.exports = auth;
