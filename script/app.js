let express = require('express');
let app = express();
let cors = require('cors');
let bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const fs = require("fs");

const controller= require('./controller');

const global = require('./global');
global.initContract(artifacts);
global.initDb();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use('/', express.static('public_static'));
app.use(cors());

const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log("Express Listening at http://localhost:" + port);
});

app.post('/test/deploycontract', async function (req, res) {
    try {
        await controller.deploycontract(req, res);
    }
    catch (err) {
        console.log(err);
    }
    
});

app.post('/test/deploycontractminted', async function (req, res) {
    try {
        await controller.deploycontractminted(req, res);
    }
    catch (err) {
        console.log(err);
    }
    
});

// app.post('/test/setparam', async function (req, res) {
//   await controller.setparamtest(global);
// });

app.post('/setparam', async function (req, res) {
  await controller.setparam(req, res, global);
});

module.exports = function (deployer) {}