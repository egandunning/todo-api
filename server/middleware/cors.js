let allowCors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Auth, Content-Type');
    res.header('Access-Control-Expose-Headers', 'X-Auth, Content-Type');
    res.header('Access-Control-Headers-Request', 'X-Auth');
    next();
}

module.exports = {allowCors};