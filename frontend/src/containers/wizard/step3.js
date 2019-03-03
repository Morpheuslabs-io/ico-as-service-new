import React, {Component} from 'react';
import Radio from '@material-ui/core/Radio';

import step3Asset from '../../assets/img/step3.svg';
import TierSetup from '../../components/wizard/TierSetup';
import InputField from '../../components/wizard/InputField';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setError, setStep3, setDeploy} from '../../redux/actions';
import {diffDates, isValidAddress, isValidEmailAddress} from '../../components/wizard/Utils';

const TIER_INITIAL_VALUES = {
  sequence: 1,
  tierName: 'Tier ',
  allowModifying: 'no',
  startDate: moment().add(1, 'day'),
  startTime: moment(),
  endDate: moment().add(2, 'day'),
  endTime: moment(),
  lockDate: moment().add(3, 'day'),
  unlockDate: moment().add(5, 'day'),
  rate: 0,
  supply: 0,
  whitelist: [],
};

const TIER_DEPLOY_INITIAL_VALUES = {
  pricing_strategy: false,
  crowdsale: false,
  finalize_agent: false,
  register_tiers: false,
  register_crowdsale: false,
  allow_crowdsale: false,
  allow_finalize: false,
  register_whitelisted: false,
  register_finalize: false,
  register_token: false,
};

class Step3 extends Component {

  state = {};

  handleChangeGasPrice = event => {
    this.props.setStep3({
      ...this.props.step3,
      gasPrice: event.target.value
    });
  };

  handleChangeEnableWhitelisting = event => {
    this.props.setStep3({
      ...this.props.step3,
      enableWhitelisting: event.target.value
    });
  };

  handleChange = (name, value) => {
    if (name === 'custom_gas')
      name = 'gasPrice';
    this.props.setStep3({
      ...this.props.step3,
      [name]: value
    });
  };

  handleChangeTier = (index, name, value) => {
    let tiers = this.props.step3.tiers;
    tiers[index] = {
      ...tiers[index],
      [name]: value,
    };

    this.props.setStep3({
      ...this.props.step3,
      tiers
    });
  };

  handleBlurWalletAddress = () => {
    if (this.props.step3.wallet_address === '' || !isValidAddress(this.props.step3.wallet_address))
      this.props.setError({
        ...this.props.error,
        errorWalletAddress: 'Please enter a valid address',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorWalletAddress: '',
      });
  };

  handleBlurEmailAddress = () => {
    if (this.props.step3.email_address === '' || !isValidEmailAddress(this.props.step3.email_address))
      this.props.setError({
        ...this.props.error,
        errorEmailAddress: 'Please enter a valid email address',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorEmailAddress: '',
      });
  };

  handleBlurCustomGas = () => {
    if (this.props.step3.gasPrice === '' || this.props.step3.gasPrice < 0.1)
      this.props.setError({
        ...this.props.error,
        errorCustomGas: 'Should be greater than 0.1',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorCustomGas: '',
      });
  };

  handleBlurMincap = () => {
    if (this.props.step3.mincap === '' || this.props.step3.mincap <= 0)
      this.props.setError({
        ...this.props.error,
        errorMincap: 'Please enter a valid number greater or equal than 0',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorMincap: '',
      });
    let validMincap = false;
    for (const id in this.props.step3.tiers) {
      if (parseFloat(this.props.step3.mincap) < parseFloat(this.props.step3.tiers[id].supply)) {
        validMincap = true;
        break;
      }
    }
    if(!validMincap)
      this.props.setError({
        ...this.props.error,
        errorMincap: 'Should be less or equal than the supply of some tier',
      });
  };

  handleAddTier = () => {
    let {step3, setStep3, error, setError, setDeploy} = this.props;

    let existError = false;
    const currentSeq = step3.tiers.length - 1;
    let errorTiers = error.errorTiers;

    let errorTierName = '';
    if (step3.tiers[currentSeq].tierName === '') {
      errorTierName = 'This field is required';
      existError = true;
    }

    let errorRate = '';
    if (step3.tiers[currentSeq].rate <= 0) {
      errorRate = 'Please enter a valid number greater than 0. Should be integer. Should not be greater than 1 quintillion (10^18)';
      existError = true;
    }

    let errorSupply = '';
    if (step3.tiers[currentSeq].supply <= 0) {
      errorSupply = 'Please enter a valid number greater than 0';
      existError = true;
    }

    for (const id in step3.tiers) {
      let startError = '', endError = '';
      const diffS = diffDates(moment(), moment(), step3.tiers[id].startDate, step3.tiers[id].startTime);
      const diffE = diffDates(moment(), moment(), step3.tiers[id].endDate, step3.tiers[id].endTime);
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
      errorTiers[id] = {
        ...errorTiers[id],
        startError,
        endError,
      }
    }
    errorTiers[currentSeq] = {
      ...errorTiers[currentSeq],
      errorTierName,
      errorRate,
      errorSupply,
    };
    setError({
      ...error,
      errorTiers,
    });

    if (!existError) {
      setStep3({
        ...step3,
        tiers: [
          ...step3.tiers,
          {
            ...TIER_INITIAL_VALUES,
            sequence: step3.tiers.length + 1,
            tierName: 'Tier ' + (step3.tiers.length + 1),
          }
        ],
      });

      setError({
        ...error,
        errorTiers: [
          ...error.errorTiers,
          {
            startError: '',
            endError: '',
            errorLock: '',
            errorRate: '',
            errorSupply: '',
            errorTierName: '',
          }
        ]
      });

      setDeploy({
        ...this.props.deploy,
        d_tiers: [
          ...this.props.deploy.d_tiers,
          {...TIER_DEPLOY_INITIAL_VALUES},
        ]
      });
    }
  };

  render() {
    return (
      <div className='step-content'>
        <div className='container step-widget'>
          <div className='widget-header'>
            <img src={step3Asset}/>
            <div>
              <p className='title'>CROWDSALE SETUP</p>
              <p className='description'>The most important and exciting part of the crowdsale process. Here you can
                define parameters of your crowdsale campaign.</p>
            </div>
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>Global Settings</p>
          </div>
          <div className='wg-content border-bottom'>
            <InputField id='wallet_address' nameLabel='Wallet Address' type='text' onChange={this.handleChange} value={this.props.step3.wallet_address}
                        description='Where the money goes after investors transactions. Immediately after each transaction. We recommend to setup a multisig wallet with hardware based signers.'
                        onBlur={this.handleBlurWalletAddress} hasError={this.props.error.errorWalletAddress}
            />
            <InputField id='email_address' nameLabel='Email Address' type='text' onChange={this.handleChange} value={this.props.step3.email_address}
                        description='Please provide an email address to receive notification of the finalized ICO wizard information.'
                        onBlur={this.handleBlurEmailAddress} hasError={this.props.error.errorEmailAddress}
            />
            <InputField id='mincap' nameLabel='Invetor Min Cap' type='number' onChange={this.handleChange} value={this.props.step3.mincap}
                        description='Minimum amount of tokens to buy. Not the minimal amount for every transaction: if minCap is 1 and a user already has 1 token from a previous transaction, they can buy any amount they want.'
                        onBlur={this.handleBlurMincap} hasError={this.props.error.errorMincap}
            />
            <div>
              <label className='wg-label'>Enable Whitelisting</label>
              <div>
                <Radio
                  checked={this.props.step3.enableWhitelisting === 'yes'}
                  onChange={this.handleChangeEnableWhitelisting}
                  value='yes' color='primary' id='yes' classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='yes'>Yes</label>
                <Radio
                  checked={this.props.step3.enableWhitelisting === 'no'}
                  onChange={this.handleChangeEnableWhitelisting}
                  value='no' color='primary' id='no' classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='no'>No</label>
              </div>
              <p className='wg-description'>Enables whitelisting. If disabled, anyone can participate in the crowdsale.</p>
            </div>
          </div>
        </div>
        {this.props.step3.tiers.map((val, key) => (
          <TierSetup
            key={key}
            index={key}
            tierData={val}
            onChange={this.handleChangeTier}/>
        ))}
        <div className='container'>
          <Button color='primary' variant="contained" component='span' className='additional-btn' onClick={this.handleAddTier}>Add Tier</Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step3: state.rootReducer.step3,
    error: state.rootReducer.error,
    deploy: state.rootReducer.deploy,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep3: bindActionCreators(setStep3, dispatch),
    setError: bindActionCreators(setError, dispatch),
    setDeploy: bindActionCreators(setDeploy, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Step3);
