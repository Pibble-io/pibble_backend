export default (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
    response.header('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization, Content-Length, X-Requested-With');

    if ( 'OPTIONS' === request.method ) {
        response.send(200);
    } else {
        next();
    }
}