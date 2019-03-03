import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import {Row, Col, Table} from 'reactstrap';
import InputField from './InputField';
import IconButton from '@material-ui/core/IconButton';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {diffDates, isValidAddress, isValidEmailAddress} from './Utils';
import DatePicker from "react-datepicker/es/index";
import moment from "moment";
import Alert from '../layouts/Alert';
import Button from '@material-ui/core/Button';
import axios from "axios";
import Spinner from 'react-spinkit';
import SweetAlert from 'sweetalert-react';
import 'sweetalert/dist/sweetalert.css';

class Vesting extends Component {

  state = {
    startVesting: moment().add(0, 'day'),
    cliffVesting: moment().add(5, 'day'),
    endVesting: moment().add(30, 'day'),
    tokenAddress: '',
    beneficiaryAddress: '',
    vestingList: {},
    emailAddress: '',
    walletAddress: '',

    alertShow: false,
    alertContent: [],
    alertHeader: '',

    resultShow: false,
    resultTitle: 'Success',
    resultText: '',
    resultType: 'success',

    spinnerShow: false,
    doneShow: false
  };

  handleChangeStartVesting = (date) => {
    this.setState({
      startVesting: date
    });
  };

  handleChangeCliffVesting = (date) => {
    this.setState({
      cliffVesting: date
    });
  };

  handleChangeEndVesting = (date) => {
    this.setState({
      endVesting: date,
    });
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  };

  validator = (startVesting, cliffVesting, endVesting, tokenAddress, beneficiaryAddress) => {
    let alertContent = []

    let diffToday = diffDates(moment(), moment(), startVesting, moment());
    if (diffToday < 0) {
      alertContent.push('Start date in the past');
    }

    diffToday = diffDates(moment(), moment(), cliffVesting, moment());
    if (diffToday <= 0) {
      alertContent.push('Cliff date in the past');
    }

    diffToday = diffDates(moment(), moment(), endVesting, moment());
    if (diffToday <= 0) {
      alertContent.push('End date in the past');
    }

    let diffs = diffDates(startVesting, moment(), endVesting, moment());
    if (diffs <= 0) {
      alertContent.push('End date should be later than start date');
    }

    diffs = diffDates(startVesting, moment(), cliffVesting, moment());
    if (diffs <= 0) {
      alertContent.push('Cliff date should be later than start date');
    }

    diffs = diffDates(cliffVesting, moment(), endVesting, moment());
    if (diffs <= 0) {
      alertContent.push('End date should be later than cliff date');
    }

    if (!isValidAddress(tokenAddress)) {
      alertContent.push('Invalid token address');
    }

    if (!isValidAddress(beneficiaryAddress)) {
      alertContent.push('Invalid beneficiary address');
    }

    return alertContent
  }

  validatorAddress = (emailAddress, walletAddress) => {
    let alertContent = []

    if (emailAddress === '') {
      alertContent.push('Please specify an email address');
    } else {
      if (!isValidEmailAddress(emailAddress)) {
        alertContent.push('Invalid email address');
      }
    }

    if (walletAddress === '') {
      alertContent.push('Please specify a wallet address');
    } else {
      if (!isValidAddress(walletAddress)) {
        alertContent.push('Invalid wallet address');
      }
    }

    return alertContent
  }

  handleToggleAlert = () => {
    const { alertShow } = this.state
    this.setState({ alertShow: !alertShow })
  }

  handleAddTokenVesting = () => {
    let {startVesting, cliffVesting, endVesting, tokenAddress, beneficiaryAddress} = this.state;
    let result = this.validator(startVesting, cliffVesting, endVesting, tokenAddress, beneficiaryAddress)
    if (result.length !== 0) {
      this.setState({
        alertShow: true,
        alertHeader: 'Token vesting creation with invalid input',
        alertContent: result
      })
      return
    }

    let currVestingList = this.state.vestingList;
    let currVestingListLength = Object.keys(currVestingList).length;
    currVestingList[currVestingListLength] = {
      startVesting, cliffVesting, endVesting, tokenAddress, beneficiaryAddress
    };

    this.setState({
      vestingList: currVestingList
    })

    console.log('handleAddTokenVesting - vestingList:', this.state.vestingList);
  };

  handleRemoveVesting = (evt) => {
    let id = evt.target.id;
    console.log('handleRemoveVesting - id:', id);
    let currVestingList = this.state.vestingList;
    if (currVestingList[id]) delete currVestingList[id];

    this.setState({
      vestingList: currVestingList
    })

    console.log('handleRemoveVesting - vestingList:', this.state.vestingList);
  };

  handleRemoveAllVesting = () => {
    this.setState({
      vestingList: {}
    })
  };

  handleSubmitTokenVesting = async () => {
    const {vestingList, emailAddress, walletAddress} = this.state;

    let result = this.validatorAddress(emailAddress, walletAddress)
    if (result.length !== 0) {
      this.setState({
        alertShow: true,
        alertHeader: 'Token vesting submission with invalid input',
        alertContent: result
      })
      return
    }
    
    // Send rest API to server
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    this.setState({
      spinnerShow: true
    });

    let data = '';

    try {
      let response = await axios.post("/setvesting", {
        vestingList, 
        emailAddress, 
        walletAddress
      });

      console.log('setvesting resp: ', response);
      
      if (response.data.status == true) {
        data = response.data.data;
        data += '\n';
        data += 'Your token-vesting contracts are being finalized.\n';
        data += 'This might take long depending on Ethereum network status.\n';
        data += 'Once done, a notification will be sent to your provided email:\n';
        data += emailAddress;
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
      console.log('setvesting err: ', err);
      
      this.setState({
        resultShow: false,
        resultTitle: 'Internal Service Error',
        resultText: data,
        resultType: 'error',
      });
    }

    // Wait for a little bit to display result to user
    setTimeout(() => {
      this.setState({
        spinnerShow: false,
        resultShow: true
      })
    }, 2000);
  }

  onDone = () => {
    this.props.history.push('/');
    // console.log('onDone - this.props:', this.props);
  }

  render() {
    const {vestingList} = this.state;

    return (
      <div className='container step-widget widget-2'>
        <div className='widget-header'>
          <div>
            <p className='title'>Token Vesting</p>
            <p className='description'>Set token vesting for beneficiary address</p>
          </div>
        </div>
        {
          this.state.spinnerShow ?
            <div>
              <Spinner 
                className='justify-content-center align-items-center mx-auto' 
                name='three-bounce' color='#00B1EF' style={{ width: 100, margin: 250 }}
                noFadeIn
              />
            </div>
            :
            <div className='wg-content'>
              <Row>
                <Col md={4}>
                  <label className='wg-label'>Start</label>
                  <DatePicker selected={this.state.startVesting} onChange={this.handleChangeStartVesting}
                              className='form-control wg-text-field' dateFormat='YYYY/MM/DD'/>
                  <p className={'field-error ' + (this.state.errorStart === '' ? '' : 'field-error-show')}>{this.state.errorStart}</p>
                  <p className='wg-description'>Choose a start date for the vesting period.</p>
                </Col>
                <Col md={4}>
                  <label className='wg-label'>Cliff</label>
                  <DatePicker selected={this.state.cliffVesting} onChange={this.handleChangeCliffVesting}
                              className='form-control wg-text-field' dateFormat='YYYY/MM/DD'/>
                  <p className={'field-error ' + (this.state.errorCliff === '' ? '' : 'field-error-show')}>{this.state.errorCliff}</p>
                  <p className='wg-description'>Choose a cliff date for the vesting period.</p>
                </Col>
                <Col md={4}>
                  <label className='wg-label'>End</label>
                  <DatePicker selected={this.state.endVesting} onChange={this.handleChangeEndVesting}
                              className='form-control wg-text-field' dateFormat='YYYY/MM/DD'/>
                  <p className={'field-error ' + (this.state.errorEnd === '' ? '' : 'field-error-show')}>{this.state.errorEnd}</p>
                  <p className='wg-description'>Choose an end date for the vesting period.</p>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <InputField id='tokenAddress' nameLabel='Token Address' type='text' onChange={this.handleChange} value={this.state.tokenAddress} description="Address of the token to be vested" hasError={this.state.errorTokenAddress}/>
                </Col>
                <Col md={4}>
                  <InputField id='beneficiaryAddress' nameLabel='Beneficiary Address' type='text' onChange={this.handleChange} value={this.state.beneficiaryAddress} description="Beneficiary address of the vested token" hasError={this.state.errorBeneficiaryAddress}/>
                </Col>
                <Col md={2}>
                  <IconButton component='span' className='add-whitelist' onClick={this.handleAddTokenVesting}><i className='fas fa-plus'/></IconButton>
                </Col>
              </Row>
              {
                Object.keys(vestingList).length !== 0 &&
                <div>
                  <br></br>
                  <table className='table table-striped table-bordered table-responsive'>
                    <thead>
                    <tr>
                      <th scope="col">Start</th>
                      <th scope="col">Cliff</th>
                      <th scope="col">End</th>
                      <th scope="col">Token Address</th>
                      <th scope="col">Beneficiary Address</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      Object.keys(vestingList).map((key) => (
                        <tr key={key}>
                          <td>{vestingList[key].startVesting.format('YYYY/MM/DD')}</td>
                          <td>{vestingList[key].cliffVesting.format('YYYY/MM/DD')}</td>
                          <td>{vestingList[key].endVesting.format('YYYY/MM/DD')}</td>
                          <td>{vestingList[key].tokenAddress}</td>
                          <td>{vestingList[key].beneficiaryAddress}</td>
                          <td><i className='far fa-trash-alt small cursor-pointer float-right' onClick={this.handleRemoveVesting} id={key}/></td>
                        </tr>
                      ))
                    }
                    </tbody>
                  </table>
                  <div className='float-right small cursor-pointer' onClick={this.handleRemoveAllVesting}><i className='far fa-trash-alt'/> Clear All
                  </div>
                  <div>
                    <Row>
                      <Col md={5}>
                        <InputField id='emailAddress' nameLabel='Email Address' type='text' onChange={this.handleChange} value={this.state.emailAddress} description="Email address to receive result notification"/>
                      </Col>
                      <Col md={6}>
                        <InputField id='walletAddress' nameLabel='Wallet Address' type='text' onChange={this.handleChange} value={this.state.walletAddress} description="Owner address of the deployed token-vesting contract"/>
                      </Col>
                    </Row>
                    <Row>
                      <Col className='float-left' md={4}>
                        <Button
                          onClick={this.handleSubmitTokenVesting}
                          variant='contained' size='large' color="primary"
                        >
                            Submit
                        </Button>
                      </Col>
                      { this.state.doneShow &&
                          <Col className='float-right' md={4}>
                            <Button
                              onClick={this.onDone}
                              variant='contained' size='large' color="primary"
                            >
                                Done
                            </Button>
                          </Col>
                      }
                    </Row>
    
                  </div>
                </div>
              }
              <Alert
                isOpen={this.state.alertShow}
                handleToggle={this.handleToggleAlert}
                alertHeader={this.state.alertHeader}
                alertContent={this.state.alertContent}
              />
            </div>
        }
        <div>
          <SweetAlert show={this.state.resultShow} type={this.state.resultType} title={this.state.resultTitle} text={this.state.resultText} onConfirm={() => this.setState({resultShow: false, doneShow: true})}/>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

//export default connect(mapStateToProps, mapDispatchToProps)(Vesting);
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Vesting)
);