const HTTPStatusCode = Object.freeze({
    OKAY: 200,
    CREATED: 201,
    BADREQUEST: 400,
    UNAUTHROIZED: 401,
    NOTFOUND: 404,
    INTERNALSERVERERROR: 500,
});

module.exports = HTTPStatusCode;