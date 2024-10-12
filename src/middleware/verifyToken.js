const jwt = require("jsonwebtoken");

const userAuthentication = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send("Invalid Token");
    }
};

const adminAuthantication = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_SECRET_ADMIN);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send("Invalid Token");
    }
};

module.exports = {
    userAuthentication,
    adminAuthantication,
};
