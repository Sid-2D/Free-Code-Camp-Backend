var app = require('express')(),
	request = require('request'),
	MongoClient = require('mongodb').MongoClient;

app.get('/api/:term', function (req, res) {
	var options = {
		url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=',
		headers: {
			'Ocp-Apim-Subscription-Key': process.env.KEY
		}
	}, buff = '';
	options.url += req.params.term + '&mkt=en-us&count=10';
	options.url = options.url.replace(/ +/g,'%20');
	if (req.query.offset) {
		options.url += '&offset=' + req.query.offset;
	}
	request(options, function (err, response, body) {
		var date = Date.now();
		date = new Date(date);
		date = date.toUTCString();
		MongoClient.connect(process.env.MONGO_URI, function (err, db) {
			db.collection('images').insertOne({
				"term": req.params.term,
				"when": date
			}, function (err) {
				if (err) {
					throw err;
				}
				db.close();
				body = JSON.parse(body);
				var arr = body.value;
				for (var i = 0; i < 10; i++) {
					var img = {
						"Image URL": arr[i].contentUrl,
						"Alt Text": arr[i].name,
						"Page URL": arr[i].hostPageDisplayUrl						
					}
					buff += JSON.stringify(img, null, 2) + '<br>';
				}
				buff = buff.replace(/ /g, '&nbsp;');
				buff = buff.replace(/\n/g, '<br>');
				res.send('<p>' + buff + '<p>');
			});
		});
	});
});

app.get('/api', function (req, res) {
	MongoClient.connect(process.env.MONGO_URI, function (err, db) {
		var cur = db.collection('images').find({},{'_id': 0}).sort({
			"_id": -1
		});
		var cnt = 0, buff = '';
		cur.each(function (err, doc) {
			if (err) {
				throw err;
			}
			if (doc == null || cnt > 9) {
				db.close();
				buff = buff.replace(/ /g, '&nbsp;');
				buff = buff.replace(/\n/g, '<br>');
				res.send(buff);
			} else {
				cnt++;
				buff += JSON.stringify(doc, null, 2) + '<br>';
			}
		});
	});
});

app.get('/', function (req, res) {
	res.send("Usage:<br>https://image-search-abtsraction.herokuapp.com/api/searchterm<br>OR<br>https://image-search-abtsraction.herokuapp.com/api");
});

app.listen(process.env.PORT || 3000, function () {
	console.log("Running...");
});