module.exports = function(app, appEnv)
{
	// var currPath = "/files";

	app.get('/', function(req, res) {
		res.sendFile(appEnv.appViews+'layout.html')
	});

}