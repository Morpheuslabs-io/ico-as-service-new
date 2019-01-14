## ICO Controller

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
