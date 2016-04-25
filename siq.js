/**
 * Created by Dustin on 2/23/16.
 */
console.log('Loading...');
var fs = require('fs');
var express = require('express');
var mongoDao = require('./mongoDao');

//modules below are express middleware
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');

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

app.use('/', mongoDao);


//traditional webserver stuff for serving static files
var WEB = __dirname + '/web';
app.use(favicon(WEB + '/favicon.ico'));
app.use(express.static(WEB, {maxAge: '12h'}));
app.get('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).sendFile(WEB + '/404Error.png');
});

//var config = JSON.parse(fs.readFileSync("/dev/nodejs/resumeServer.json"));
var port = process.env.port || 3000;
var server = app.listen(port);

function gracefulShutdown(){
    console.log("\nStarting shutdown...");
    server.close(function(){
        connection.end();
        console.log('Shutdown complete.');
    });
}

process.on('SIGTERM', function(){
    gracefulShutdown();
});

process.on('SIGINT', function(){
    gracefulShutdown();
});


console.log(`Listening on port ${port}`);
