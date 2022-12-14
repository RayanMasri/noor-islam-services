const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const fs = require('fs');
var cors = require('cors');

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.use(cors());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

// Add headers before the routes are defined
// app.use(function (req, res, next) {
// 	// Website you wish to allow to connect
// 	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

// 	// Request methods you wish to allow
// 	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

// 	// Request headers you wish to allow
// 	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

// 	// Set to true if you need the website to include cookies in the requests sent
// 	// to the API (e.g. in case you use sessions)
// 	res.setHeader('Access-Control-Allow-Credentials', true);

// 	// Pass to next layer of middleware
// 	next();
// });

app.use(express.static('./build'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/build/index.html');
});
app.get('/ping', (req, res) => {
	res.send('OK');
});

app.post('/search', (req, res) => {
	if (req.body.national) {
		let info = data[req.body.national];
		if (info) {
			res.json({
				...info,
				error: false,
			});
		} else {
			res.json({ error: true, reason: 'رقم هوية غير موجود' });
		}
	} else {
		res.json({ error: true, reason: 'معلمات غير صالحة' });
	}

	// res.json({ error: true, reason: 'حدث خطأ ما' });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
