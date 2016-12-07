module.exports = function(app, appEnv)
{
	// Creating instance of request handler.
	require('./files')(app, appEnv);
}	