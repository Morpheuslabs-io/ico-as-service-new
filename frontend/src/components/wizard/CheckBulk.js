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
import Papa from 'papaparse';

class TokenCheckBulk extends Component {

  state = {
    emailAddress: '',

    dataList: [],

    resultShow: false,
    resultTitle: 'Success',
    resultText: '',
    resultType: 'success',

    spinnerShow: false,
    doneShow: false
  };

  handleChangeCheckPoint = (date) => {
    this.setState({
      toTime: date
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

  validator = (toTime, cliffVesting, endVesting, userAddress, holdAmount1) => {
    let alertContent = []

    let diffToday = diffDates(moment(), moment(), toTime, moment());
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

    let diffs = diffDates(toTime, moment(), endVesting, moment());
    if (diffs <= 0) {
      alertContent.push('End date should be later than start date');
    }

    diffs = diffDates(toTime, moment(), cliffVesting, moment());
    if (diffs <= 0) {
      alertContent.push('Cliff date should be later than start date');
    }

    diffs = diffDates(cliffVesting, moment(), endVesting, moment());
    if (diffs <= 0) {
      alertContent.push('End date should be later than cliff date');
    }

    if (!isValidAddress(userAddress)) {
      alertContent.push('Invalid token address');
    }

    if (!isValidAddress(holdAmount1)) {
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
    let {toTime, cliffVesting, endVesting, userAddress, holdAmount1} = this.state;
    let result = this.validator(toTime, cliffVesting, endVesting, userAddress, holdAmount1)
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
      toTime, cliffVesting, endVesting, userAddress, holdAmount1
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

  handleSubmitTokenChecking = async () => {
    const {
      toTime,
      userAddress,
      tokenAddress1,
      holdAmount1,
      tokenAddress2,
      holdAmount2
    } = this.state;

    // Send rest API to server
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    this.setState({
      spinnerShow: true
    });

    let data = '';

    try {
      let response = await axios.post("/checktokenpair", {
        userAddress, tokenAddress1, holdAmount1, tokenAddress2, holdAmount2, 
        toTime: new Date(toTime).getTime()/1000,
        toTimeStr: toTime.format()
      });

      console.log('checktokenpair resp: ', response);
      
      data = response.data.msg;

      this.setState({
        resultShow: true,
        resultTitle: 'Success',
        resultText: response.data.msg,
        resultType: 'success',
      });
    } catch (err) {
      console.log('checktokenpair err: ', err);
      
      this.setState({
        resultShow: true,
        resultTitle: 'Internal Service Error',
        resultText: '',
        resultType: 'error',
      });
    }

    this.setState({
      spinnerShow: false
    });
  }

  onDone = () => {
    this.props.history.push('/');
    // console.log('onDone - this.props:', this.props);
  }

  handleUploadCSV = event => {
    const file = event.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        let csv = Papa.parse(fileReader.result);
        let dataList = [];
        for (const id in csv.data) {
          let line = csv.data[id];
          dataList.push({
            userAddress: line[0], 
            tokenAddress1: line[1], 
            holdAmount1: line[2], 
            tokenAddress2: line[3], 
            holdAmount2: line[4], 
            toTime: new Date(line[5]).getTime()/1000,
            toTimeStr: line[5]
          });
        }
        this.setState({
          dataList: dataList,
          resultShow: true,
          resultTitle: 'Success',
          resultText: 'CSV file imported',
          resultType: 'success',
        });
      };
      fileReader.readAsText(file);
      event.target.value = null;
    } else {
      this.setState({
        resultShow: true,
        resultTitle: 'Error',
        resultText: 'Failed to import CSV file',
        resultType: 'error',
      });
    }
  }

  addDataList = (csvDataArr) => {

  }

  render() {
    const {vestingList} = this.state;

    return (
      <div className='container step-widget widget-2'>
        <div className='widget-header'>
          <div>
            <p className='title'>Token Checker</p>
            <p className='description'>Wizard for bulk check</p>
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
                <Col>
                  <input id={'upload-csv'} className='upload-csv' multiple type='file' accept=".csv" onChange={this.handleUploadCSV}/>
                  <label htmlFor={'upload-csv'}>
                    <Button variant="contained" component='span' className='upload-btn'>
                      <i className='fas fa-upload'/>
                      &nbsp; Upload CSV
                    </Button>
                  </label>
                </Col>
                <Col>
                  <a className='float-right' href='/sample.csv'>Download Sample CSV</a>
                </Col>
              </Row>
              <br></br>
              <div>
                {
                  this.state.dataList.length !== 0 &&
                  <div>
                      <table className='table table-striped table-bordered table-responsive'>
                        <thead>
                        <tr>
                          <th>Check Point</th>
                          <th>User Address</th>
                          <th>Token Address 1</th>
                          <th>Hold Amount 1</th>
                          <th>Token Address 2</th>
                          <th>Hold Amount 2</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                          this.state.dataList.map((val, key) => (
                            <tr key={key}>
                              <td>{val.toTimeStr}</td>
                              <td>{val.userAddress}</td>
                              <td>{val.tokenAddress1}</td>
                              <td>{val.holdAmount1}</td>
                              <td>{val.tokenAddress2}</td>
                              <td>{val.holdAmount2}</td>
                            </tr>
                          ))
                        }
                        </tbody>
                      </table>
                      <br></br>  
                      <Button
                        className='float-left'
                        onClick={this.handleSubmitTokenChecking}
                        variant='contained' size='large' color="primary"
                      >
                          Submit
                      </Button>
                      <br></br>
                  </div>
                }
              </div>  
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

//export default connect(mapStateToProps, mapDispatchToProps)(TokenCheckBulk);
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TokenCheckBulk)
);
