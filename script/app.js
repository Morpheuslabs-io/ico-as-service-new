let express = require('express');
let app = express();
var server = require('http').createServer(app);
let cors = require('cors');
let bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require("fs");

const controller= require('./controller');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use('/', express.static('public_static'));
app.use(cors());

const port = 4000 || process.env.PORT;

server.listen(port, () => {
  console.log('Server is running on port ', port);
});


app.post('/setparam', async function (req, res) {
  await controller.setparam(req, res, global);
});

app.post('/checktoken', async function (req, res) {
  await controller.checktoken(req, res);
});

module.exports = function (deployer) {}