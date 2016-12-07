var express = require('express')

var app = express()

app.use(express.static('./public'))

app.set('views', './views')

var appEnv		=	{"appPath": __dirname, "appViews":  __dirname + "/views/"};

// Import Routers.
require('./router')(app, appEnv);

var srv = app.listen(8000, function() {
	console.log('Listening on '+process.env.PORT)
})

app.use('/peerjs', require('peer').ExpressPeerServer(srv, {
	debug: true
}))
