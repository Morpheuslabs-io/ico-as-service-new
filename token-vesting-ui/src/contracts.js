import contract from 'truffle-contract'
import Network from "./network"

export async function getTokenVesting(address) {
  const TokenVesting = contract(require('contracts/TokenVesting.json'))
  const provider = await Network.provider()
  TokenVesting.setProvider(provider)
  return TokenVesting.at(address)
}

export async function getToken(address) {
  const Token = contract(require('contracts/CrowdsaleTokenExt.json'))
  const provider = await Network.provider()
  Token.setProvider(provider)
  return Token.at(address)
}
