# ICO as service - ICO Wizard Frontend

Morpheus Labs provides ICO as service - ICO Wizard utility to automaticaly generate and deploy ERC20 based token smart contracts to Ethereum testnet or mainnet for ICO purpose based on parameters specified through ICO wizard.

## System description

- Web-based Wizard for ICO and Token Vesting will walk user through a number of steps to fill out the required data.

- At the end, upon submission of the wizard, user will receive a response with short notice:

```
Your ICO (or Token Vesting) contracts are being finalized. This might take hours depending on Ethereum network. A notification will be sent to your provided email once done.
```

## System operation

The system operation includes the following steps

#### Installation

  `yarn install`

#### Start frontend server

- `pm2 start pm2/script_ico_wizard_frontend.sh`

#### ICO-wizard link

http://104.248.144.168:3000/
    

## ICO Wizard Usage

#### Token Setup
    
    - Token setup
    
        - `Name`: The token name, no limited string.
    
        - `Ticker`: The token symbol, it should not be exceed 5 characters and must be only alphanumeric characters.
    
        - `Decimals`: It refers to how divisible a token can be, from 0 (not at all divisible) to 18.
    
    - Reserved token.
    
        - `Address`: Reserved token address.
        
        - `Dimension`: Fixed amount or percentage of crowdsaled tokens.
        
        - `Value`: Value in tokens.
        
    - Token vesting
        
        - `Start date`: Date from when the vesting is started.
        
        - `End date`: Date untill when the vesting is ended.
        
        - `Amount`: Vesting amount as percentage.
        
#### Crowdsale Setup
    
    - Global settings
    
        - `Wallet address`: Where the money goes after investors transactions.
        
        - `Investor min cap`: Minimum amount of tokens to buy.
        
        - `Enable whiltelisting`: Enables whitelisting. If disabled, anyone can participate in the crowdsale.
        
    - Crowdsale tier setup
        
        - `Crowdsale setup name`: Name of a tier
        
        - `Allow modifying`: A creator of the crowdsale can modify Start time, End time, Rate after publishing.
        
        - `Start time`: Date and time when the tier starts.
        
        - `End time`: Date and time when the tier ends.
        
        - `Lock date`: Tokens of this tier will be locked from this date.
        
        - `Unlock date`: Tokens of this tier will be unlocked from this date. Unlock date should be later than the last tier's end time.
        
        - `Rate`: Exchange rate Ethereum to Tokens.
        
        - `Supply`: How many tokens will be sold on this tier.
        
    - Whitelist
        
        - `Address`: Whitelisted account address.
        
        - `Min`: Minimum amount tokens to buy.
        
        - `Max`: Maximum is the hard limit.

## Token-Vesting Wizard Usage

#### Required data

User can add as many entries of the following as possible:

  - Start date for the vesting period
  - Cliff date for the vesting period
  - End date for the vesting period
  - Address of the token to be vested
  - Beneficiary address of the vested token

In addition:
  
  - Email address to receive result notification
  - Owner address of the deployed token-vesting contract

#### Transfer token

After having submitted the Token-Vesting wizard, user can transfer the tokens to the deployed Token-Vesting contract which corresponds to a specific beneficiary address.