var express = require('express'),
	app = express();

function dater (date) {
	var tmp = "", month, day, year;
	month = date.getMonth();
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
					'September', 'October', 'November', 'December'];
	day = date.getDate();
	year = date.getFullYear();
	tmp = months[month] + ' ' + day + ', ' + year;
	return tmp;
}

app.get('/*', function (req, res) {
	var str = req.url;
	if (str == '/') {
		res.send("Please pass a string in the URL.");
	}
	else {
		str = str.substr(1);
		str = decodeURI(str);
		var obj = {};
		if (/^\d+$/.test(str)) {
			str = Number(str);
		}
		var date = new Date(str);
		if (date == "Invalid Date") {
			obj["unix"] = null;
			obj["natural"] = null;
		} else {
			if (/^\d+$/.test(str)) {
				obj["unix"] = str;
			}
			else {
				obj["unix"] = Date.parse(date);
			}
			obj["natural"] = dater(date);
		}
		res.send(JSON.stringify(obj));
	}
});

app.listen(process.env.PORT || 3000, function () {
	console.log("Server is live!");
});