/**
 * Dustin Hurst
 * Siq App
 * created 2/28/2016
 */
console.log('Loading Server');
var fs = require('fs');
var express = require('express');

//modules below are express middleware
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var _ = require('underscore');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'orionman',
    database : 'siq'
});

connection.connect();

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(bodyParser.json());

app.use(logger('dev'));

app.use(compression());

app.use(allowCrossDomain);

var db = [
    { id:1, "panelHeading":"Foo", "panelBody":"All your base are belong to us!" },
    { id:2, "panelHeading":"Bar", "panelBody":"I can haz cheesburger?" },
    { id:3, "panelHeading":"Baz", "panelBody":"Hooked on phonics worked for me!" }
];

//REST API calls go here.
app.get('/api/testdb', function(req, res){
    connection.query("select * from entries", function(err, rows, fields) {
        if (err) throw err;
//console.log('The solution is: ', rows[0].solution);
        res.json(rows);
    });
});

app.get('/api/entries', function(req, res) {
    connection.query("select subject, id from entries", function(err, rows, fields) {
        if (err) throw err;
//console.log('The solution is: ', rows[0].solution);
        res.json(rows);
    });
});

// IDEMPOTENT - You can repeat the operation as many times as you want without changing state.
// Create
app.post('/api/entries', function(req, res){
// Store new entry and return id.
    console.log(req.body);
// {"subject":"Two","content":"content2"}
    var subject = req.body.subject;
    var content = req.body.content;

// TODO escape query for SQL injection
    connection.query(`INSERT INTO entries (subject, content) VALUES( '${subject}', '${content}')`, function(err, rows, fields) {
        if (err) throw err;
        res.json(rows.insertId);
    });
});

// Read
app.get('/api/entries/:id', function(req, res){
    var id = connection.escape(req.params.id);
//var id = req.params.id;
    console.log(`select * from entries where id = ${id}`);
    connection.query(`select * from entries where id = ${id}`, function(err, rows, fields) {
        if (err) throw err;
        res.json(rows[0]);
    });
});

// Update
app.put('/api/entries/:id', function(req, res){

});

// Delete
app.delete('/api/entries/:id', function(req, res){
    var id = connection.escape(req.params.id);
    connection.query(`delete from entries where id = ${id}`, function(err, rows, fields) {
        if (err) throw err;
    });
    console.log("server delete ");
    res.sendStatus(200);
});

//traditional webserver stuff for serving static files
var WEB = __dirname + '/web';
app.use(favicon(WEB + '/favicon.ico'));
app.use(express.static(WEB));
app.get('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).sendFile(WEB + '/404Error.png');
});

//var config = JSON.parse(fs.readFileSync("/dev/nodejs/resumeServer.json"));
var port = process.env.port || 3000;
var server = app.listen(port);

function gracefullShutdown(){
    console.log('\nStarting Shutdown');
    server.close(function(){
        console.log("before end call");
        connection.end();
        console.log('\nShutdown Complete');
    });
}

process.on('SIGTERM', function(){
    gracefullShutdown();
});

process.on('SIGINT', function(){
    gracefullShutdown();
});

console.log(`Listening on port ${port}`);

