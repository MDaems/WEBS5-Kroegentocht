var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var app = require('express')();

app.set('view engine', 'jade');

var index = require('../routes/index');
app.use('/', index);

describe("TestTest", function () {
   it("Test should equal Test", function () {
      expect("Test").to.equal("Test");
   });
});

describe("Home", function(){
    // should return home page
    it("Should return home page.",function(done){
        // calling home page api
        request(app)
            .get('/')
            .end(function(err, res){
                res.status.should.equal(200);
                done(err);
            });
    });
});

describe("API", function(){
    describe("Users", function() {
        it("Should be redirected to the login page because I am not authorised.", function (done) {
            request("http://localhost:3000")
                .get('/api/all/users')
                .end(function (err, res) {
                    res.status.should.equal(302);
                    expect(res.body.users).to.be.undefined;
                    done(err);
                });
        });

        it("Should return all the users in a Json object.", function (done) {
            request("http://localhost:3000")
                .get('/api/noauth/users')
                .end(function (err, res) {
                    res.status.should.equal(200);
                    expect(res.body).to.be.a('array');
                    done(err);
                });
        });

        it("Should create a new user.", function (done) {
            request("http://localhost:3000")
                .post('/api/noauth/user/newuser')
                .send({email: 'zezima@runescape.com', username: 'Zezima', password: 'Zezima', role: 'user'})
                .end(function (err, res) {
                    res.status.should.equal(200);
                    done(err);
                });
        });

        it("Should get one user with a name.", function (done) {
            request("http://localhost:3000")
                .get('/api/noauth/user/name/Zezima')
                .end(function (err, res) {
                    expect(res.body).to.have.deep.property('role');
                    done(err);
                });
        });
    });

    describe("Races", function() {
        it("Should return all the races in a Json object.",function(done){
            request("http://localhost:3000")
                .get('/api/races')
                .end(function(err, res){
                    res.status.should.equal(200);
                    expect(res.body).to.be.a('array');
                    done(err);
                });
        });

        it ("Should create a race", function(done) {
            request("http://localhost:3000")
                .get('/api/race/new/')
                .end(function(err, res) {
                    res.status.should.equal(200);
                    done(err);
                });
        });
    });

    describe("Waypoints", function() {
        it("Should return all the waypoints in a JSON object.", function(done) {
            request("http://localhost:3000")
                .get ('/api/waypoints/')
                .end(function(err, res) {
                    res.status.should.equal(200);
                    expect(res.body).to.be.a('array');
                    done(err);
                });
        });

        it ("Should add a waypoint to the race with the specified ID", function(done) {
            request("http://localhost:3000")
                .post ('/api/race/572f43d7585a259822e907f1/waypoints/add/')
                .send({ name: "TEST", lat: 50, long: 51 })
                .end(function(err, res) {
                    res.status.should.equal(200);
                    expect(res.body).to.have.deep.property('success', true);
                    done(err);
                });
        });
    });
});