## ICO Wizard Server

## System description

The server has 4 components:

- `Cron job`: running in background and periodically pre-deploy the set of contracts
- `Sqlite db`: used to store the predeployed contracts.
- `Express-based server`: provide rest APIs for handling of the ICO-wizard requests
- `ICO-wizard handler`: perform the parameter setting for the pre-deployed contracts based on the provided ICO data extracted from the request.

**Notice**
Error-handling and retry-mechanism are applied for the contract predeployment and setting to ensure that if something is broken inbetween, it will be retried and the breaking won't break the entire lengthy process.


#### Setting

2 setting files `mainnet.json` and `testnet.json` reside in folder `setting`
can be used to configure needed params for interacting with testnet rinkeby or mainnet.

`testnet.json` is used as reference.

For security reason, neither `Mnemonic` nor `Private key` is used directly.
Instead, `keyfile` and `passphrase` are used.
`Keyfile` is currently stored in folder `keyfile`.
It's possible to use myetherwallet.com to generate an account with keyfile

#### Install deps

`npm i`

#### Compile/build smart contract

`npm run build`

#### Deploy contract to testnet rinkeby or to mainnet

`npm run deploy-rinkeby`

`npm run deploy-mainnet`

#### Start backend app interacting with testnet rinkeby or mainnet

`npm run rinkeby`

`npm run mainnet`
