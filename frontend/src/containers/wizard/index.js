import React, {Component} from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import {bindActionCreators} from 'redux';
import contract from 'truffle-contract';
import SweetAlert from 'sweetalert-react';
import moment from 'moment';
import Spinner from 'react-spinkit';

import 'sweetalert/dist/sweetalert.css';

import Stepper from '../../components/wizard/Stepper';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import Step5 from './step5';
import BottomButtons from './BottomButtons';
import {setError, setStep, setStep2, setStep3, setDeploy} from '../../redux/actions';
import {countDecimalPlaces, diffDates, isValidEmailAddress, isValidAddress, toFixed, validMetamask} from '../../components/wizard/Utils';
import axios from "axios";
import _ from "lodash";

import SAFEMATH_LIB_EXT from '../../artifacts/SafeMathLibExt';
import CROWDSALE_TOKEN_CONTRACT from '../../artifacts/CrowdsaleTokenExt';
import PRICING_STRATEGY_CONTRACT from '../../artifacts/FlatPricingExt';
import MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT from '../../artifacts/MintedTokenCappedCrowdsaleExt';
import FINALIZE_AGENT_CONTRACT from '../../artifacts/ReservedTokensFinalizeAgent';

let web3 = null;
if (typeof(window.web3) !== 'undefined') {
  web3 = window.web3;
}

class Wizard extends Component {

  state = {
    resultShow: false,
    resultTitle: '',
    resultText: '',
    resultType: 'warning',
    spinnerShow: false
  };

  constructor(props) {
    super(props);
  };

  handleContinueStep = async () => {
    const {step, step2, step3, error, setError, setStep3} = this.props;
    switch (step) {
      case 1:
        if (step === 5) return;
        this.props.setStep(step + 1);
        break;
      case 2:
        let errorName, errorTicker, errorDecimals;
        if (step2.name === '')
          errorName = 'This field is required';
        else
          errorName = '';

        if (step2.ticker === '')
          errorTicker = 'This field is required';
        else
          errorTicker = '';
        if (step2.ticker.length > 5)
          errorTicker = 'Please enter a valid ticker between 1-5 characters';
        if (step2.ticker !== '' && !(/^[a-z0-9]+$/i.test(step2.ticker)))
          errorTicker = 'Only alphanumeric characters';

        if (step2.decimals === '')
          errorDecimals = 'This field is required';
        else
          errorDecimals = '';
        if (step2.decimals > 18)
          errorDecimals = 'Should not be greater than 18';
        if (step2.decimals < 0)
          errorDecimals = 'Should not be less than 0';

        setError({
          ...error,
          errorName: errorName,
          errorTicker: errorTicker,
          errorDecimals: errorDecimals,
        });

        if (errorName === '' && errorTicker === '' && errorDecimals === '') {
          setStep3({
            ...step3,
            wallet_address: web3 ? web3.eth.accounts[0] : '',
          });

          if (step === 5) return;
          this.props.setStep(step + 1);
        }
        break;
      case 3:
        let errorWalletAddress, errorEmailAddress, errorMincap, errorCustomGas;
        let existError = false;

        if (step3.wallet_address === '' || !isValidAddress(step3.wallet_address)) {
          errorWalletAddress = 'Please enter a valid address';
          existError = true;
        }
        else
          errorWalletAddress = '';

        if (step3.email_address === '' || !isValidEmailAddress(step3.email_address)) {
          errorEmailAddress = 'Please enter a valid email address';
          existError = true;
        }
        else
          errorEmailAddress = '';

        if (step3.gasPrice === '' || step3.gasPrice < 0.1) {
          errorCustomGas = 'Should be greater than 0.1';
          existError = true;
        }
        else
          errorCustomGas = '';

        if (step3.mincap === '' || step3.mincap <= 0) {
          errorMincap = 'Please enter a valid number greater or equal than 0';
          existError = true;
        }
        else
          errorMincap = '';

        let validMincap = false;
        for (const id in step3.tiers) {
          if (parseFloat(step3.mincap) < parseFloat(step3.tiers[id].supply)) {
            validMincap = true;
            break;
          }
        }
        if (!validMincap) {
          errorMincap = 'Should be less or equal than the supply of some tier';
          existError = true;
        }

        let errorTiers = error.errorTiers;
        for (const id in step3.tiers) {
          let errorTierName = '';
          if (!step3.tiers[id].tierName) {
            errorTierName = 'This field is required';
            existError = true;
          }

          let errorRate = '';
          if (step3.tiers[id].rate <= 0) {
            errorRate = 'Please enter a valid number greater than 0. Should be integer. Should not be greater than 1 quintillion (10^18)';
            existError = true;
          }

          let errorSupply = '';
          if (step3.tiers[id].supply <= 0) {
            errorSupply = 'Please enter a valid number greater than 0';
            existError = true;
          }
          let startError = '', endError = '', errorLock = '';

          if (!step3.tiers[id].startDate || !step3.tiers[id].startTime)
            startError = 'Should not be empty';
          if (!step3.tiers[id].endDate || !step3.tiers[id].endTime)
            endError = 'Should not be empty';
          if (!step3.tiers[id].lockDate || !step3.tiers[id].unlockDate)
            errorLock = 'Should not be empty';
          if (startError || endError || errorLock)
          {
            errorTiers[id] = {
              startError,
              endError,
              errorLock,
              errorTierName,
              errorRate,
              errorSupply,
            };
            existError = true;
            continue;
          }

          const diffS = diffDates(moment(), moment(), step3.tiers[id].startDate, step3.tiers[id].startTime);
          const diffE = diffDates(moment(), moment(), step3.tiers[id].endDate, step3.tiers[id].endTime);
          let diffL = diffDates(step3.tiers[id].lockDate, moment(), step3.tiers[id].unlockDate, moment());
          if (diffS <= 0 || diffE <= 0) {
            startError = diffS < 0 ? 'Should be set in the future' : '';
            endError = diffE < 0 ? 'Should be set in the future' : '';
            existError = true;
          } else {
            let diff = diffDates(step3.tiers[id].startDate, step3.tiers[id].startTime, step3.tiers[id].endDate, step3.tiers[id].endTime);
            if (diff <= 0) {
              startError = 'Should be previous than same tier\'s End Time';
              endError = 'Should be later than same tier\'s Start Time';
              existError = true;
            } else if (id != 0) {
              diff = diffDates(step3.tiers[id - 1].endDate, step3.tiers[id - 1].endTime, step3.tiers[id].startDate, step3.tiers[id].startTime);
              if (diff <= 0) {
                startError = 'Should be same or next than previous tier\'s End Time';
                existError = true;
              }
            }
          }
          if (diffL <= 0) {
            errorLock = 'Unlock date should be next than lock date.';
            existError = true;
          } else {
            diffL = diffDates(step3.tiers[step3.tiers.length - 1].endDate, moment(), step3.tiers[id].unlockDate, moment());
            if (diffL <= 0) {
              errorLock = 'Unlock date should be next than last tier\'s datetime';
              existError = true;
            } else {
              diffL = diffDates(moment(), moment(), step3.tiers[id].lockDate, moment());
              if (diffL <= 0) {
                errorLock = 'Lock date should be set in the future';
                existError = true;
              }
            }
          }
          errorTiers[id] = {
            startError,
            endError,
            errorLock,
            errorTierName,
            errorRate,
            errorSupply,
          };
        }
        setError({
          ...error,
          errorWalletAddress: errorWalletAddress,
          errorEmailAddress: errorEmailAddress,
          errorCustomGas: errorCustomGas,
          errorMincap: errorMincap,
          errorTiers,
        });

        if (!existError) {
          if (step === 5) return;
          this.props.setStep(step + 1);
          // this.deployContracts();
          this.setParamContracts();
        }
        break;
      case 4:
        if (step === 5) return;
        this.props.setStep(step + 1);
        break;
      case 5:
        this.props.history.push('/');
        return;
    }
    window.scrollTo(0, 0);
  };

  setParamContracts = async () => {

    this.setState({
      spinnerShow: true
    });

    let myTiers = this.props.step3.tiers;
    for (let i = 0; i < myTiers.length; i++){
      myTiers[i].startDate = myTiers[i].startDate.format('YYYY-MM-DD');
      myTiers[i].startTime = myTiers[i].startTime.format('HH:mm:SS');

      myTiers[i].endDate = myTiers[i].endDate.format('YYYY-MM-DD');
      myTiers[i].endTime = myTiers[i].endTime.format('HH:mm:SS');
    }

    let step2 = this.props.step2;
    let step3 = this.props.step3;
    step3.tiers = myTiers;
    
    // Send rest API to server
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    console.log('step2:', step2);
    console.log('step3:', step3);

    let data = '';

    try {
      let response = await axios.post("/setparam", {
        step2,
        step3
      });

      console.log('setparam resp: ', response);
      
      if (response.data.status == true) {
        let respData = response.data.data;
        data = respData.data;

        if (step3.email_address) {
          data += 'Your ICO contracts are being finalized.\n';
          data += 'This might take long depending on Ethereum network status.\n';
          data += 'Once done, a notification will be sent to your provided email:\n';
          data += step3.email_address;
        }

        let dataCrowdsale = respData.dataCrowdsale;
        let d_tiers = this.props.deploy.d_tiers;
        for (let i=0; i<dataCrowdsale.length; i++) {
          d_tiers[i].crowdsale = dataCrowdsale[i];
          d_tiers[i].token = respData.dataToken;
          setDeploy({
            ...this.props.deploy,
            d_tiers
          });
        }
      } else {
        data = response.data.message;
      }
      
      this.setState({
        resultShow: false,
        resultTitle: 'Success',
        resultText: data,
        resultType: 'success',
      });
    } catch (err) {
      console.log('setparam err: ', err);
      
      this.setState({
        resultShow: false,
        resultTitle: 'Internal Service Error',
        resultText: data,
        resultType: 'error',
      });
    }

    // Only when server returns the predeployed addresses without any setting of params
    setTimeout(() => {
      this.setState({
        spinnerShow: false,
        resultShow: true
      })
    }, 2000);
  }

  // deployContracts = async () => {
  //   const {name, ticker, decimals, reserved_token} = this.props.step2;
  //   const {wallet_address, gasPrice, mincap, enableWhitelisting, tiers} = this.props.step3;
  //   const {setDeploy} = this.props;

  //   let safeMathLibExtLibrary = contract(SAFEMATH_LIB_EXT);
  //   let crowdsaleTokenContract = contract(CROWDSALE_TOKEN_CONTRACT);
  //   let pricingStrategyContract = contract(PRICING_STRATEGY_CONTRACT);
  //   let mintedTokenCappedCrowdsaleExtContract = contract(MINTED_TOKEN_CAPPED_CROWDSALE_EXT_CONTRACT);
  //   let finalizeAgentContract = contract(FINALIZE_AGENT_CONTRACT);

  //   safeMathLibExtLibrary.setProvider(web3.currentProvider);
  //   crowdsaleTokenContract.setProvider(web3.currentProvider);
  //   pricingStrategyContract.setProvider(web3.currentProvider);
  //   mintedTokenCappedCrowdsaleExtContract.setProvider(web3.currentProvider);
  //   finalizeAgentContract.setProvider(web3.currentProvider);

  //   let initSupply = 0;
  //   for (let i = 0; i < tiers.length; i++)
  //     initSupply += parseFloat(tiers[i].supply);

  //   const gasOpt = {from: web3.eth.accounts[0], gasPrice: gasPrice * 1000000000, gas: 6000000};

  //   let safemathLibExtInstance = await safeMathLibExtLibrary.new(gasOpt);
  //   console.log(`SafeMathLibExt Library Deployed: ${safemathLibExtInstance.address}`);
  //   setDeploy({
  //     ...this.props.deploy,
  //     safemath: safemathLibExtInstance.address,
  //   });

  //   await crowdsaleTokenContract.detectNetwork();
  //   await crowdsaleTokenContract.link('SafeMathLibExt', safemathLibExtInstance.address);
  //   await mintedTokenCappedCrowdsaleExtContract.detectNetwork();
  //   await mintedTokenCappedCrowdsaleExtContract.link('SafeMathLibExt', safemathLibExtInstance.address);
  //   await pricingStrategyContract.detectNetwork();
  //   await pricingStrategyContract.link('SafeMathLibExt', safemathLibExtInstance.address);
  //   await finalizeAgentContract.detectNetwork();
  //   await finalizeAgentContract.link('SafeMathLibExt', safemathLibExtInstance.address);
  //   console.log(`SafeMathLibExt Linked to Contracts.`);

  //   let crowdsaleTokenInstance = await crowdsaleTokenContract.new(name, ticker, initSupply, decimals, true, mincap, {
  //     from: web3.eth.accounts[0],
  //     gasPrice: gasPrice * 1000000000,
  //     gas: 6000000
  //   });
  //   console.log(`CrowdsaleToken Contract Deployed: ${crowdsaleTokenInstance.address}`);
  //   setDeploy({
  //     ...this.props.deploy,
  //     token: crowdsaleTokenInstance.address,
  //   });

  //   let pricingStrategyInstance = [];
  //   for (let i = 0; i < tiers.length; i++) {
  //     const instance = await pricingStrategyContract.new(tiers[i].rate, gasOpt);
  //     pricingStrategyInstance.push(instance);
  //     console.log(`PricingStrategy Contract(${i + 1}) Deployed: ${instance.address}`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].pricing_strategy = pricingStrategyInstance[i].address;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   let mintedTokenCrowdsaleInstance = [];
  //   for (let i = 0; i < tiers.length; i++) {
  //     const _name = tiers[i].tierName;
  //     const _token = crowdsaleTokenInstance.address;
  //     const _pricingStrategy = pricingStrategyInstance[i].address;
  //     const _multisigWallet = wallet_address;
  //     const _start = moment(tiers[i].startDate.format('YYYY-MM-DD') + ' ' + tiers[i].startTime.format('HH:mm:SS'), 'YYYY-MM-DD HH:mm:SS').unix();
  //     const _end = moment(tiers[i].endDate.format('YYYY-MM-DD') + ' ' + tiers[i].endTime.format('HH:mm:SS'), 'YYYY-MM-DD HH:mm:SS').unix();
  //     const _minimumFundingGoal = 100;
  //     const _maximumSellableTokens = tiers[i].supply;
  //     const _isWhiteListed = tiers[i].whitelist.length > 0;
  //     console.log(_isWhiteListed);

  //     const instance = await mintedTokenCappedCrowdsaleExtContract.new(_name, _token, _pricingStrategy, _multisigWallet, _start, _end, _minimumFundingGoal, _maximumSellableTokens, _isWhiteListed, {
  //       from: web3.eth.accounts[0],
  //       gasPrice: gasPrice * 1000000000,
  //       gas: 7000000
  //     });
  //     mintedTokenCrowdsaleInstance.push(instance);
  //     console.log(`Minted Token CrowdsaleEx Contract(${i + 1}) Deployed: ${instance.address}`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].crowdsale = mintedTokenCrowdsaleInstance[i].address;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   setDeploy({
  //     ...this.props.deploy,
  //     crowdsale_address: true,
  //   });

  //   let finalizeAgentInstance = [];
  //   for (let i = 0; i < tiers.length; i++) {
  //     const instance = await finalizeAgentContract.new(crowdsaleTokenInstance.address, mintedTokenCrowdsaleInstance[i].address, gasOpt);
  //     finalizeAgentInstance.push(instance);
  //     console.log(`FinalizeAgent Contract(${i + 1}) Deployed: ${instance.address}`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].finalize_agent = finalizeAgentInstance[i].address;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Register tier address for Pricing strategy
  //   for (let i = 0; i < pricingStrategyInstance.length; i++) {
  //     let contractX = web3.eth.contract(pricingStrategyInstance[i].abi).at(pricingStrategyInstance[i].address);
  //     let tx = await this.promisify(cb => contractX.setTier(mintedTokenCrowdsaleInstance[i].address, gasOpt, cb));
  //     console.log(`Register tier address for Pricing strategy(${i + 1})`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].register_tiers = tx;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Register addresses for Reserved Tokens
  //   if (reserved_token.length !== 0) {
  //     let addrs = [];
  //     let inTokens = [];
  //     let inPercentageUnit = [];
  //     let inPercentageDecimals = [];
  //     for (let i = 0; i < reserved_token.length; i++) {
  //       let _inTokens = 0;
  //       let _inPercentageDecimals = 0;
  //       let _inPercentageUnit = 0;
  //       if (reserved_token[i].dimension === 'tokens')
  //         _inTokens = reserved_token[i].tokenAmount * 10 ** decimals;
  //       else {
  //         _inPercentageDecimals = countDecimalPlaces(reserved_token[i].tokenAmount);
  //         _inPercentageUnit = reserved_token[i].tokenAmount * 10 ** _inPercentageDecimals;
  //       }
  //       addrs.push(reserved_token[i].address);
  //       inTokens.push(reserved_token[i].dimension === 'tokens' ? toFixed(_inTokens.toString()) : 0);
  //       inPercentageUnit.push(_inPercentageUnit ? _inPercentageUnit : 0);
  //       inPercentageDecimals.push(_inPercentageDecimals ? _inPercentageDecimals : 0);
  //     }
  //     let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  //     let tx = await this.promisify(cb => contractX.setReservedTokensListMultiple(addrs, inTokens, inPercentageUnit, inPercentageDecimals, gasOpt, cb));
  //     console.log(`Register addresses for Reserved Tokens`);
  //     setDeploy({
  //       ...this.props.deploy,
  //       reserve_token: true,
  //     });
  //   }

  //   // Register Crowdsales addresses
  //   const crowdsaleAddresses = _.map(mintedTokenCrowdsaleInstance, 'address');
  //   for (let i=0; i<mintedTokenCrowdsaleInstance.length; i++) {
  //   }
  //   for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
  //     let contractX = web3.eth.contract(mintedTokenCrowdsaleInstance[i].abi).at(mintedTokenCrowdsaleInstance[i].address);
  //     let tx = await this.promisify(cb => contractX.updateJoinedCrowdsalesMultiple(crowdsaleAddresses, gasOpt, cb));
  //     console.log(`Crowdsale(${i+1}) is associated to current account`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].register_crowdsale = true;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Allow Crowdsale Contract to Mint Tokens
  //   for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
  //     let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  //     let tx = await this.promisify(cb => contractX.setMintAgent(mintedTokenCrowdsaleInstance[i].address, true, gasOpt, cb));
  //     console.log(`Allow Crowdsale Contract to Mint Tokens(${i + 1})`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].allow_crowdsale = tx;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Allow Finalize Agent Contract to Mint Token
  //   for (let i = 0; i < finalizeAgentInstance.length; i++) {
  //     let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  //     let tx = await this.promisify(cb => contractX.setMintAgent(finalizeAgentInstance[i].address, true, gasOpt, cb));
  //     console.log(`Allow Finalize Agent Contract to Mint Token(${i + 1})`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].allow_finalize = tx;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Register whitelisted addresses
  //   if (enableWhitelisting === 'yes') {
  //     for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
  //       let addrs = [];
  //       let statuses = [];
  //       let minCaps = [];
  //       let maxCaps = [];
  //       for (let j = 0; j < tiers[i].whitelist.length; j++) {
  //         addrs.push(tiers[i].whitelist[j].w_address);
  //         statuses.push(true);
  //         minCaps.push(tiers[i].whitelist[j].w_min * 10 ** decimals ? toFixed((tiers[i].whitelist[j].w_min * 10 ** decimals).toString()) : 0);
  //         maxCaps.push(tiers[i].whitelist[j].w_max * 10 ** decimals ? toFixed((tiers[i].whitelist[j].w_max * 10 ** decimals).toString()) : 0);
  //       }
  //       let contractX = web3.eth.contract(mintedTokenCrowdsaleInstance[i].abi).at(mintedTokenCrowdsaleInstance[i].address);
  //       let tx = await this.promisify(cb => contractX.setEarlyParticipantWhitelistMultiple(addrs, statuses, minCaps, maxCaps, gasOpt, cb));

  //       let d_tiers = this.props.deploy.d_tiers;
  //       d_tiers[i].register_whitelisted = true;
  //       setDeploy({
  //         ...this.props.deploy,
  //         d_tiers,
  //       });
  //     }
  //   }

  //   // Register Finalize Agent Contract addresses
  //   for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
  //     let contractX = web3.eth.contract(mintedTokenCrowdsaleInstance[i].abi).at(mintedTokenCrowdsaleInstance[i].address);
  //     let tx = await this.promisify(cb => contractX.setFinalizeAgent(finalizeAgentInstance[i].address, gasOpt, cb));
  //     console.log(`Register Finalize Agent Contract addresses(${i + 1})`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].register_finalize = tx;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Register Token release addresses
  //   for (let i = 0; i < finalizeAgentInstance.length; i++) {
  //     let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  //     let tx = await this.promisify(cb => contractX.setReleaseAgent(finalizeAgentInstance[i].address, gasOpt, cb));
  //     console.log(`Register Token release addresses(${i + 1})`);
  //     let d_tiers = this.props.deploy.d_tiers;
  //     d_tiers[i].register_token = tx;
  //     setDeploy({
  //       ...this.props.deploy,
  //       d_tiers,
  //     });
  //   }

  //   // Vesting Token
  //   console.log(`Token Vesting Contract Deployed`);
  //   setDeploy({
  //     ...this.props.deploy,
  //     vesting: true,
  //   });

  //   // Transfer ownership to wallet address
  //   let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  //   let tx = await this.promisify(cb => contractX.transferOwnership(wallet_address, gasOpt, cb));
  //   console.log(`Transfer ownership to wallet address`);
  //   setDeploy({
  //     ...this.props.deploy,
  //     ownership: tx,
  //   });

  // };

  promisify = (inner) =>
    new Promise((resolve, reject) =>
      inner((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    );

  handleBackStep = () => {
    const {step} = this.props;
    if (step === 1) return;
    this.props.setStep(step - 1);
    window.scrollTo(0, 0);
  };

  handleInvest = () => {
    const {token} = this.props;
    const dashboardUrl = process.env.REACT_APP_ICO_DASHBOARD;
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.headers.common.authorization = `Bearer ${token.token}`;

    const {name, ticker, decimals, reserved_token} = this.props.step2;
    const {wallet_address, mincap, enableWhitelisting, tiers} = this.props.step3;
    const {vestings} = this.props.step5;
    const {deploy} = this.props;

    let initSupply = 0;
    for (let i = 0; i < tiers.length; i++)
      initSupply += parseFloat(tiers[i].supply);

    let crowdsaleAddr = [];
    let pricingStrategyAddr = [];
    let finalizeAgentAddr = [];
    for (let i=0; i < deploy.d_tiers.length; i++) {
      crowdsaleAddr.push(deploy.d_tiers[i].crowdsale);
      pricingStrategyAddr.push(deploy.d_tiers[i].pricing_strategy);
      finalizeAgentAddr.push(deploy.d_tiers[i].finalize_agent);
    }

    const params = {
      "token": {
        "name": name,
        "symbol": ticker,
        "totalSupply": initSupply,
        "decimal": decimals
      },
      "beneficiaryAddress": wallet_address,
      "mincap": mincap,
      "whitelisted": enableWhitelisting,
      "tiers": tiers,
      "contractAddress": {
        "token": deploy.token,
        "crowdsale": crowdsaleAddr,
        "safemath": deploy.safemath,
        "pricingStrategy": pricingStrategyAddr,
        "finalizeAgent": finalizeAgentAddr
      },
      "reservedTokens": reserved_token,
      "vestings": vestings,
      "network": "",
    };

    if (web3) {
      web3.version.getNetwork((err, netId) => {
        let net = "Main";
        switch (netId) {
          case "1":
            net = "Main";
            break;
          case "3":
            net = "Ropsten";
            break;
          case "4":
            net = "Rinkeby";
            break;
          case "42":
            net = "Kovan";
            break;
          default:
            net = "Unknown";
            break;
        }
        params.network = net;

        axios.post("admin/contract", params).then(response => {
          localStorage.clear();
          window.location.href = dashboardUrl + "/contracts";
        }).catch(err => {
          console.log(err);
        });
      });
    }
  };

  render() {
    let stepContent = null;
    const {step} = this.props;
    
    // Skip step4
    if (step == 4){
      this.props.setStep(5);
    }
    
    switch (step) {
      case 1:
        stepContent = <Step1/>;
        break;
      case 2:
        stepContent = <Step2/>;
        break;
      case 3:
        stepContent = <Step3/>;
        break;
      case 4:
        stepContent = <Step4/>;
        break;
      case 5:
        stepContent = <Step5/>;
        break;
    }

    if (this.state.spinnerShow) {
      return (
        <Spinner 
          className='justify-content-center align-items-center mx-auto' 
          name='three-bounce' color='#00B1EF' style={{ width: 100, margin: 250 }}
          noFadeIn
        />
      );
    } else { 
      return (
        <div className='page-content wizard'>
          <Stepper step={step}/>
          
          <div className='page-wrapper d-flex flex-column'>
            {stepContent}

            <BottomButtons step={step} onContinue={this.handleContinueStep} onBack={this.handleBackStep} onInvest={this.handleInvest}/>
            <SweetAlert show={this.state.resultShow} type={this.state.resultType} title={this.state.resultTitle} text={this.state.resultText}
                        onConfirm={() => this.setState({resultShow: false})}/>
          </div>
        </div>
      );
    }
  }
}


function mapStateToProps(state) {
  return {
    step: state.rootReducer.wizard.step,
    step1: state.rootReducer.step1,
    step2: state.rootReducer.step2,
    step3: state.rootReducer.step3,
    step5: state.rootReducer.step5,
    error: state.rootReducer.error,
    deploy: state.rootReducer.deploy,
    token: state.rootReducer.token,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep: bindActionCreators(setStep, dispatch),
    setStep2: bindActionCreators(setStep2, dispatch),
    setStep3: bindActionCreators(setStep3, dispatch),
    setError: bindActionCreators(setError, dispatch),
    setDeploy: bindActionCreators(setDeploy, dispatch),
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Wizard)
);
