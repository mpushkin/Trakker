var config = require('../server/config'),
    should = require('should'),
    supertest = require('supertest'),
    api = supertest('http://localhost:' + config.port);

describe('Authentication', function () {

    describe('For non-authenticated users', function (done) {

        it('allows access to static resources', function (done) {
            api.get('/index.html')
            .expect(200, done)
        });

        it('does not allow access to protected resources', function (done) {
            api.get('/users/' + config.test.user + '/projects')
            .expect(401, done)
        });

    });


});