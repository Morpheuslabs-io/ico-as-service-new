import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux';
import SweetAlert from 'sweetalert-react';
import {bindActionCreators} from 'redux';

import 'sweetalert/dist/sweetalert.css';

import icoBox from '../../assets/img/ico-box.svg';
import step1Asset from '../../assets/img/step1.svg';
import step2Asset from '../../assets/img/step2.svg';
import step3Asset from '../../assets/img/step3.svg';
import step4Asset from '../../assets/img/step4.svg';
import step5Asset from '../../assets/img/step5.svg';
import {decrypt, validMetamask} from '../../components/wizard/Utils';
import StepInfo from '../../components/landing/StepInfo';
import {setStep, setToken} from "../../redux/actions";

class Landing extends Component {

  state = {
    alertShow: false,
    alertTitle: '',
    alertText: '',
    alertType: 'warning',
  };

  componentDidMount() {
    if (this.props.location.search) {
      const token = this.props.location.search.split("=")[1];
      localStorage.setItem("token", token);
    }
  }

  handleWizard = () => {
    this.props.history.push('/wizard');
    this.props.setStep(1);
  };

  handleTokenVesing = () => {
    this.props.history.push('/tokenvesting');
  };

  render() {
    return (
      <div className='page-content landing'>
        <div className='icobox'>
          <img className='icobox-icon' src={icoBox}/>
          <h1>Welcome to ICO As Service</h1>
          <p>
            ICO As Service is a client side tool to create token and crowdsale contracts in five steps. It helps you to
            publish contracts on the Ethereum network, verify them in Etherscan, create a crowdsale page with stats. For
            participants, the wizard creates a page to invest into the campaign.Smart contracts based on TokenMarket
            contracts.
          </p>
          <div className='buttons'>
            <Button 
              onClick={this.handleTokenVesing}
              variant='contained' size='large' color="primary" className='choose-contract'>Token Checker</Button>
          </div>
        </div>
        <div className='back-line'></div>
        <div className='steps'>
          <StepInfo imageUrl={step1Asset} no='Step 1' title='CROWDSALE CONTRACT'
                    description='Select a strategy for crowdsale contract'/>
          <StepInfo imageUrl={step2Asset} no='Step 2' title='TOKEN SETUP'
                    description='Setup token and reserved distribution'/>
          <StepInfo imageUrl={step3Asset} no='Step 3' title='CROWDSALE SETUP'
                    description='Setup tiers and crowdsale parameters'/>
          <StepInfo imageUrl={step4Asset} no='Step 4' title='PUBLISH'
                    description='Get generated code and artifacts for verification in Etherscan'/>
          <StepInfo imageUrl={step5Asset} no='Step 5' title='DASHBOARD PAGE'
                    description='Go to Dashboard page and management of ICO smart contract'/>
        </div>
        <SweetAlert show={this.state.alertShow} type={this.state.alertType} title={this.state.alertTitle} text={this.state.alertText}
                    onConfirm={() => this.setState({alertShow: false})}/>
      </div>
    );
  }
}

Landing.propTypes = {
  history: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    setStep: bindActionCreators(setStep, dispatch),
    setToken: bindActionCreators(setToken, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(Landing);
