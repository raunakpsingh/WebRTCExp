var https = require('https');
var fs = require('fs');
var express = require('express');

var options = {
    key: fs.readFileSync('/etc/apache2/ssl/server.key'),
    cert: fs.readFileSync('/etc/apache2/ssl/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

var app = express();

app.use(express.static('./public'));

app.set('views', './views');

var appEnv = { "appPath": __dirname, "appViews": __dirname + "/views/" };

// Import Routers.
require('./router')(app, appEnv);

var server = https.createServer(options, app).listen(3000, function(){
    console.log("server started at port 3000");
});

app.use('/peerjs', require('peer').ExpressPeerServer(server, {
    debug: true
}));
