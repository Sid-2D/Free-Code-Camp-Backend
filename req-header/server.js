var express = require('express'),
	app = express();

app.get('/*', function (req, res) {
	var buff = "";
	var ans = {};
	ans["ipaddress"] = req.headers['x-forwarded-for'] || 
     				   req.connection.remoteAddress || 
     				   req.socket.remoteAddress ||
     				   req.connection.socket.remoteAddress;
	ans["language"] = req.headers['accept-language'].replace(/,.*/,'');
	ans["software"] = req.headers['user-agent'].match(/\([^\(]+\)/).join('');
	ans["software"] = ans["software"].substr(1, ans["software"].length-2);
	res.send(JSON.stringify(ans));
});

app.listen(process.env.PORT || 3000, function () {
	console.log("Running...");
});