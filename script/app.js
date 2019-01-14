let express = require('express');
let app = express();
let bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require("fs");

const utils = require('./utils')
const controller= require('./controller');

const global = require('./global');
global.initContract(artifacts);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use('/', express.static('public_static'));

const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log("Express Listening at http://localhost:" + port);
});

app.post('/test/icotoken', async function (req, res) {
    try {
        await controller.createIcoToken(req, res);
    }
    catch (err) {
        console.log(err);
    }
    
});

module.exports = function (deployer) {}