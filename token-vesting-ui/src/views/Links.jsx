import React from 'react'

function ContractLink({ address }) {
  let isTestNet = process.env.REACT_APP_TEST_NET;
  
  const href = isTestNet ? `https://rinkeby.etherscan.io/address/${address}` :
    `https://etherscan.io/address/${address}`

  return <a href={ href } target="_blank">{ address }</a>
}

function TokenLink({ address, name }) {
  let isTestNet = process.env.REACT_APP_TEST_NET;
  
  const href = isTestNet ? `https://rinkeby.etherscan.io/address/${address}` :
    `https://etherscan.io/token/${address}`
    
  return <a href={ href } target="_blank">{ name }</a>
}


export { ContractLink, TokenLink }