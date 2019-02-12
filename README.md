## ICO As service - ICO Wizard

## System description

The server has 4 components:

- `Cron job`: running in background and periodically pre-deploy the set of contracts. Each of the predeployed contracts will also be published to EtherScan.
- `Sqlite db`: used to store the predeployed contracts. Physical file `sqlite.db` is stored in folder `database`
- `Express-based server`: provide rest APIs for handling of the ICO-wizard requests
- `ICO-wizard handler`: perform the parameter setting for the pre-deployed contracts based on the provided ICO data extracted from the request.

**Notice**
Error-handling and retry-mechanism are applied for the contract predeployment and setting to ensure that if something is broken inbetween, it will be retried and the breaking won't break the entire lengthy process.


## Setting

2 setting files `mainnet.json` and `testnet.json` reside in folder `setting`
can be used to configure needed params for interacting with testnet rinkeby or mainnet.

`testnet.json` is used as reference. A number of configurations is specified there.

For security reason, neither `Mnemonic` nor `Private key` is used directly.
Instead, `keyfile` and `passphrase` are used.
`Keyfile` is currently stored in folder `keyfile`.
It's possible to use https://www.myetherwallet.com/ to generate an account with keyfile

## Installation

`npm i`

**Notice**

Please follow this link to install `pm2` tool if not yet
http://pm2.keymetrics.io/docs/usage/quick-start/

2 important cmds are:

- `pm2 start some_script_name`: used to start a program in background

- `pm2 status`: used to view a list of running pm2-started program

- `pm2 log some_id`: used to view log output of a pm2-started program

## Smart contract

- If being modified, smart contracts must be compiled again with this cmd `npm run build`

- In addition, smart contracts must be flattened again by executing the script `script_create_flatten.sh` inside folder `pm2`. The flattened contract files, which are stored in folder `contracts-flatten`, are used for publishing to EtherScan.


## Start server

#### in foreground

- `npm run server-rinkeby`: for interacting with testnet rinkeby

- `npm run server-mainnet`: for interacting with mainnet

#### in background

- `pm2 start pm2/script_server_rinkeby.sh`: for interacting with testnet rinkeby

- `pm2 start pm2/script_server_mainnet.sh`: for interacting with mainnet

## Start cron-job

#### in foreground

- `npm run cron-rinkeby`: for interacting with testnet rinkeby

- `npm run cron-mainnet`: for interacting with mainnet

#### in background

- `pm2 start pm2/script_cron_rinkeby.sh`: for interacting with testnet rinkeby

- `pm2 start pm2/script_cron_mainnet.sh`: for interacting with mainnet

## View Sqlite database

Please install `sqlite3` tool if not yet

- `sqlite3 -column -header`: log in sqlite session

- `.open "path_to_ico_dir/database/sqlite.db"`: open the database

- Example: `.open "/root/ICO-wizard-backend/database/sqlite.db"`

- `.tables`: view existing tables

- `select * from table_name;`: view table content

- Example: `select * from address1;`

- Example: `select * from address2;`

- Example: `select * from user;`
