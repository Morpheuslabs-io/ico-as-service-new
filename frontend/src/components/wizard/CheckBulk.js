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
    email: '',

    dataList: [],

    resultShow: false,
    resultTitle: 'Success',
    resultText: '',
    resultType: 'success',

    spinnerShow: false,
    doneShow: false
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  };

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

  handleSubmit = async () => {
    if (this.state.email === '') {
      this.setState({
        resultShow: true,
        resultTitle: 'Warning',
        resultText: 'Please enter your email address',
        resultType: 'warning',
      });
      return
    }

    const {
      email,
      dataList
    } = this.state;

    // Send rest API to server
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    this.setState({
      spinnerShow: true
    });

    let data = '';

    try {
      let response = await axios.post("/checkbulk", {
        email,
        dataList
      });

      console.log('checkbulk resp: ', response);
      
      data = response.data;

      this.setState({
        resultShow: true,
        resultTitle: 'Success',
        resultText: data,
        resultType: 'success',
      });
    } catch (err) {
      console.log('checkbulk err: ', err);
      
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

  render() {
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
                <InputField id='email' nameLabel='Email' type='text' onChange={this.handleChange} value={this.state.email} description="Email address for receiving the token checking result"/>
              </Row>
              <br></br>
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
                        onClick={this.handleSubmit}
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
