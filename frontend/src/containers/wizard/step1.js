import React, {Component} from 'react';
import Radio from '@material-ui/core/Radio';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {setDeploy, setError, setStep, setStep1, setStep2, setStep3, setStep5} from '../../redux/actions';

import step1Asset from '../../assets/img/step1.svg';
import SweetAlert from "sweetalert-react";
import moment from "moment";

class Step1 extends Component {

  state = {
    alertConfirmShow: false,
    alertTitle: '',
    alertText: '',
    alertType: 'warning',
  };

  componentDidMount() {
    const {step2} = this.props;
    if (step2.name || step2.ticker) {
      this.setState({
        alertConfirmShow: true,
        alertTitle: 'Question',
        alertText: 'Do you want to restore previous wizard data?',
        alertType: 'warning',
      });
    } else {
      this.initWizard();
    }
  }

  handleChangeWhitelist = (evt) => {
    this.props.setStep1({
      whitelist_cap: evt.target.checked
    });
  };

  initWizard = () => {
    const {setStep1, setStep2, setStep3, setStep5, setError} = this.props;
    setStep1({
      whitelist_cap: true
    });
    setStep2({
      name: 'Morpheus',
      ticker: 'MMM',
      decimals: 18,
      reserved_token: [],
    });
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
      rate: 10,
      supply: 1000000,
      whitelist: [],
    };
    setStep3({
      wallet_address: '0x8847F80cB1b2B567679B3166A0C828453e122c7F',
      email_address: '',
      gasPrice: '3.01',
      mincap: 1,
      enableWhitelisting: 'no',
      tiers: [{...TIER_INITIAL_VALUES, tierName: 'Tier 1'}],
    });
    setStep5({
      vestings: [],
    });
    setError({
      errorName: '',
      errorTicker: '',
      errorDecimals: '',

      errorWalletAddress: '',
      errorEmailAddress: '',
      errorMincap: '',
      errorCustomGas: '',
      errorTiers: [{
        startError: '',
        endError: '',
        errorLock: '',
        errorRate: '',
        errorSupply: '',
        errorTierName: '',
      }],
    });

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

    setDeploy({
      safemath: false,
      token: false,
      crowdsale_address: false,
      reserve_token: false,
      vesting: false,
      ownership: false,
      d_tiers: [
        TIER_DEPLOY_INITIAL_VALUES,
      ]
    });
  };

  render() {
    return (
      <div className='step-content'>
        <div className='container step-widget'>
          <div className='widget-header'>
            <img src={step1Asset}/>
            <div>
              <p className='title'>CrowdSale Page</p>
              <p className='description'>Select a strategy for your crowdsale contract.</p>
            </div>
          </div>
          <div className='cs-2'>
            <Radio color='primary' id='whitelist-cap' classes={{root: 'primary-color', checked: 'checked'}} checked={true} onChange={this.handleChangeWhitelist}/>
            <div>
              <label className='title' htmlFor='whitelist-cap'>Whitelist with cap</label>
              <p className='description'>Modern crowdsale strategy with multiple tiers, whitelists, and <br/>
                limits. Recommended for every crowdsale.</p>
            </div>
          </div>
        </div>
        <SweetAlert show={this.state.alertConfirmShow} type={this.state.alertType} title={this.state.alertTitle} text={this.state.alertText}
                    showCancelButton onConfirm={() => this.setState({alertConfirmShow: false})} onCancel={() => {
          this.setState({alertConfirmShow: false});
          this.initWizard();
        }}
                    onClose={() => console.log('close')}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    deploy: state.rootReducer.deploy,
    step1: state.rootReducer.step1,
    step2: state.rootReducer.step2,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep: bindActionCreators(setStep, dispatch),
    setStep1: bindActionCreators(setStep1, dispatch),
    setStep2: bindActionCreators(setStep2, dispatch),
    setStep3: bindActionCreators(setStep3, dispatch),
    setStep5: bindActionCreators(setStep5, dispatch),
    setError: bindActionCreators(setError, dispatch),
    setDeploy: bindActionCreators(setDeploy, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Step1);