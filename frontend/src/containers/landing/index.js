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
import {getNetwork} from '../../components/wizard/Utils';
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

  handleSingleCheck = () => {
    //this.props.history.push('/checksingle');
    this.setState({
      alertShow: true,
      alertTitle: '',
      alertText: 'Please use "Bulk Check"',
      alertType: 'info',
    })
  };

  handleBulkCheck = () => {
    this.props.history.push('/checkbulk');
  };

  render() {
    return (
      <div className='page-content landing'>
        <div className='icobox'>
          <img className='icobox-icon' src={icoBox}/>
          <h1>Welcome to Token Checker on {getNetwork()}</h1>
          <div className='buttons'>
            <Button
              onClick={this.handleSingleCheck}
              variant='contained' size='large' color="primary" className='choose-contract'>Single Check
            </Button>
            <Button 
              onClick={this.handleBulkCheck}
              variant='contained' size='large' color="primary" className='choose-contract'>Bulk Check
            </Button>
          </div>
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
