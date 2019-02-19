# ICO as service - ICO Wizard

Morpheus Labs provides ICO as service - ICO Wizard utility to automaticaly generate and deploy ERC20 based token smart contracts to Ethereum testnet or mainnet for ICO purpose based on parameters specified through ICO wizard.

## System description

#### Configuration

2 setting files `mainnet.json` and `testnet.json` reside in folder `setting`
can be used to configure needed params for interacting with testnet rinkeby or mainnet.

`testnet.json` is used as reference. A number of configurations is specified there.

For security reason, neither `Mnemonic` nor `Private key` is used directly.
Instead, `keyfile` and `passphrase` are used.
`Keyfile` is currently stored in folder `keyfile`.
It's possible to use https://www.myetherwallet.com/ to generate an account with keyfile

#### Cron job 

- Run in background and periodically pre-deploy the set of contracts. Each of the predeployed contracts will also be published to EtherScan. 

- The contract pre-deployment will be suspended if the max gas price is exceeded or the max limit of the contract sets is exceeded.

- Important configuration params: `PREDEPLOY_INTERVAL`, `PREDEPLOY_MAX` and `PREDEPLOY_GAS_PRICE_MAX`

- 2 separate cron jobs for pre-deploying of:

  - set of ICO contracts
  - TokenVesting contract

#### Sqlite db

Used to store the predeployed contracts and ICO/Token-Vesting data. Physical file `sqlite.db` is stored in folder `database`.

The database includes the following tables:

**ICO-related**

- `address1`: store ICO token contract address

- `address2`: store contract addresses of crowdsale, pricing strategy and finalized agent.

- `user`: store the ICO wizard data including the data set by user and the notification data sent via email. This is for later administration purpose.

**TokenVesting-related**

- `addressVesting`: store TokenVesting contract address

- `userVesting`: store the TokenVesting wizard data including the data set by user and the notification data sent via email. This is for later administration purpose.

#### Express-based API server 

Provide rest APIs for handling of:

- ICO-wizard request: `/setparam`

- Token-Vesting wizard request: `/setvesting`

**Notice**
Error-handling and retry-mechanism are applied for the contract predeployment and setting to ensure that if something is broken inbetween, it will be retried and the breaking won't break the entire lengthy process. The number of retries is configurable.

#### TokenVesting server

- Used to host the GUI content of the token vesting data/chart.
- Located in a sub-folder `token-vesting-ui`

## System operation

The system operation includes the following steps

#### Installation

`npm i`

**Notice**

Please follow this link to install `pm2` tool if not yet
http://pm2.keymetrics.io/docs/usage/quick-start/

2 important cmds are:

- `pm2 start some_script_name`: used to start a program in background

- `pm2 status`: used to view a list of running pm2-started program

- `pm2 log some_id`: used to view log output of a pm2-started program

#### Smart contract

- If being modified, smart contracts must be compiled with this cmd `npm run build`

- In addition, smart contracts must be flattened by executing the script `script_create_flatten.sh` inside folder `pm2`. The flattened contract files, which are stored in folder `contracts-flatten`, are used for publishing to EtherScan.


#### Start API server

**in foreground**

- `npm run server-rinkeby`: for interacting with testnet rinkeby

- `npm run server-mainnet`: for interacting with mainnet

**in background**

- `pm2 start pm2/script_server_rinkeby.sh`: for interacting with testnet rinkeby

- `pm2 start pm2/script_server_mainnet.sh`: for interacting with mainnet

#### Start cron-job of ICO

**in foreground**

- `npm run cron-rinkeby`: for interacting with testnet rinkeby

- `npm run cron-mainnet`: for interacting with mainnet

**in background**

- `pm2 start pm2/script_cron_rinkeby.sh`: for interacting with testnet rinkeby

- `pm2 start pm2/script_cron_mainnet.sh`: for interacting with mainnet

#### Start cron-job of TokenVesting

**in foreground**

- `npm run cronvesting-rinkeby`: for interacting with testnet rinkeby

- `npm run cronvesting-mainnet`: for interacting with mainnet

**in background**

- `pm2 start pm2/script_cronvesting_rinkeby.sh`: for interacting with testnet rinkeby

- `pm2 start pm2/script_cronvesting_mainnet.sh`: for interacting with mainnet

#### TokenVesting server

- cd to sub-folder `token-vesting-ui`

- Run the installation: `npm i`

- Start server: 
  
  - `pm2 start pm2/script_tokenvesting_ui_rinkeby.sh`: for interacting with Rinkeby testnet

  - `pm2 start pm2/script_tokenvesting_ui_mainnet.sh`: for interacting with mainnet

#### View Sqlite database

Please install `sqlite3` tool if not yet

- `sqlite3 -column -header`: log in sqlite session

- `.open "path_to_ico_dir/database/sqlite.db"`: open the database

- Example: `.open "/root/ICO-wizard-backend/database/sqlite.db"`

- `.tables`: view existing tables

- `select * from table_name;`: view table content

- Example: `select * from address1;`

- Example: `select * from address2;`

- Example: `select * from user;`
