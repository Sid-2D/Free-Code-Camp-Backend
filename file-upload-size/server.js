var app = require('express')(),
	multer = require('multer');

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/upload', multer({dest: 'uploads/'}).single('file'), function (req, res) {
	var json = {
		"size": req.file.size
	}
	res.send(json);
});

app.listen(process.env.PORT || 3000);