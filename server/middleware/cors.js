let allowCors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Auth, Content-Type');
    res.header('Access-Control-Expose-Headers', 'X-Auth, Content-Type');
    res.header('Access-Control-Request-Headers', 'X-Auth');
    next();
}

module.exports = {allowCors};