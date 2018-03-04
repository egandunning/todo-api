let allowCors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', 'x-auth, Content-Type');
    res.header('Access-Control-Expose-Headers', 'x-auth, Content-Type');
    next();
}

module.exports = {allowCors};