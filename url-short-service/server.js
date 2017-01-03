var MongoClient = require('mongodb').MongoClient,
	express = require('express'),
	request = require('request'),
	app = express();

app.get('/new/*', function (req, res) {
	var url = req.url.substr(5);
	request(url, function (err, reqRes, html) {
		if (err) {
			var json = {
				"error" : "This URL does not exist."
			}
			res.send(json);
		}
		else {
			MongoClient.connect(process.env.MLAB_URI , function (err, db) {
				db.collection('sample').count(function (err, count) {
					var doc = {
						'ShortURL': count + 1,
						'url': url
					}
					db.collection('sample').insertOne(doc, function (err, insertRes) {
						db.close();
						var json = {
							"ShortURL": "https://url-short-service.herokuapp.com/" + doc.ShortURL,
							"URL": doc.url
						}
						res.send(json);
					});
				});
			});
		}
	});
});

app.get('/*', function (req, res) {
	var url = req.url.substr(1);
	if (url == '' || url == 'new') {
		res.send('Use /new/yourUrl to create a URL.<br>Or<br>Use /yourUrl to access it.');
	} else {
		var query = {
			'ShortURL':	Number(url)
		}
		MongoClient.connect(process.env.MLAB_URI, function (err, db) {
			db.collection('sample').find(query).toArray(function (err ,docs) {
				if (docs.length) {
					db.close();
					res.redirect(docs[0].url);
				}
				else {
					var json = {
						"error": "This URL does not exist in database."
					}
					res.send(json);
				}
			});
		});
	}
});

app.listen(process.env.PORT);