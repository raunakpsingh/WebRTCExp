module.exports = function(app, appEnv)
{
	// URL: /
	app.get('/', function(req, res) {
		res.sendFile(appEnv.appViews + 'index.html');
	});
}