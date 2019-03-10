import React, {Component} from 'react';
import { withRouter } from 'react-router-dom';
import {Row, Col, Table} from 'reactstrap';
import InputField from './InputField';
import {connect} from 'react-redux';
import {getNetwork} from './Utils';
import Button from '@material-ui/core/Button';
import axios from "axios";
import Spinner from 'react-spinkit';
import SweetAlert from 'sweetalert-react';
import 'sweetalert/dist/sweetalert.css';
import Papa from 'papaparse';
import DatePicker from "react-datepicker/es/index";

class TokenCheckBulk extends Component {

  state = {
    resultShow: false,
    resultTitle: 'Success',
    resultText: '',
    resultType: 'success',

    spinnerShow: false,
    doneShow: false,

    email: '',
    userList: [],
    toTime: null,

    tokenAddress1: '0x4a527d8fc13c5203ab24ba0944f4cb14658d1db6',
    holdAmount11: 15000,
    holdAmount12: 30000,
    holdAmount13: 100000,
    
    tokenAddress2: '0xea26c4ac16d4a5a106820bc8aee85fd0b7b2b664',
    holdAmount21: 5000,
    holdAmount22: 10000,
    holdAmount23: 30000
  };

  handleChangeCheckPoint = (date) => {
    this.setState({
      toTime: date
    });
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
      userList,
      toTime,
      
      tokenAddress1,
      holdAmount11,
      holdAmount12,
      holdAmount13,
      
      tokenAddress2,
      holdAmount21,
      holdAmount22,
      holdAmount23

    } = this.state;

    // Send rest API to server
    axios.defaults.baseURL = process.env.REACT_APP_API_HOST;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    this.setState({
      spinnerShow: true
    });

    let data = '';

    const params = {
      email,
      userList,
      toTime: new Date(toTime).getTime()/1000,
      toTimeStr: toTime.format(),
      
      tokenAddress1,
      holdAmount11,
      holdAmount12,
      holdAmount13,
      
      tokenAddress2,
      holdAmount21,
      holdAmount22,
      holdAmount23
    }

    console.log('params:', params);

    try {
      let response = await axios.post("/checkbulk", params);

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
        let userList = [];
        for (const id in csv.data) {
          let line = csv.data[id];
          userList.push(line[0]);
        }
        this.setState({
          userList: userList,
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

  // handleUploadCSV = event => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     let fileReader = new FileReader();
  //     fileReader.onloadend = (e) => {
  //       let csv = Papa.parse(fileReader.result);
  //       let userList = [];
  //       for (const id in csv.data) {
  //         let line = csv.data[id];
  //         userList.push({
  //           userAddress: line[0], 
  //           tokenAddress1: line[1], 
  //           holdAmount1: line[2], 
  //           tokenAddress2: line[3], 
  //           holdAmount2: line[4], 
  //           toTime: new Date(line[5]).getTime()/1000,
  //           toTimeStr: line[5]
  //         });
  //       }
  //       this.setState({
  //         userList: userList,
  //         resultShow: true,
  //         resultTitle: 'Success',
  //         resultText: 'CSV file imported',
  //         resultType: 'success',
  //       });
  //     };
  //     fileReader.readAsText(file);
  //     event.target.value = null;
  //   } else {
  //     this.setState({
  //       resultShow: true,
  //       resultTitle: 'Error',
  //       resultText: 'Failed to import CSV file',
  //       resultType: 'error',
  //     });
  //   }
  // }

  render() {
    return (
      <div className='container step-widget widget-2'>
        <div className='widget-header'>
          <div>
            <p className='title'>Token Checker on {getNetwork()}</p>
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
                <Col md={4}>
                  <InputField id='email' nameLabel='Email' type='text' onChange={this.handleChange} value={this.state.email} />
                </Col>
                <Col md={4}>
                  <label className='wg-label'>Check Point</label>
                  <DatePicker selected={this.state.toTime} onChange={this.handleChangeCheckPoint}
                              className='form-control wg-text-field' dateFormat='YYYY/MM/DD'/>
                </Col>
              </Row>
              <br></br>
              <Row>
                <Col md={3}>
                  <InputField id='tokenAddress1' nameLabel='MITx Token' type='text' onChange={this.handleChange} value={this.state.tokenAddress1} />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount11' nameLabel='Hold Amount 1' type='text' onChange={this.handleChange} value={this.state.holdAmount11}  />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount12' nameLabel='Hold Amount 2' type='text' onChange={this.handleChange} value={this.state.holdAmount12}  />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount13' nameLabel='Hold Amount 3' type='text' onChange={this.handleChange} value={this.state.holdAmount13}  />
                </Col>
              </Row>
              <br></br>
              <Row>
                <Col md={3}>
                  <InputField id='tokenAddress2' nameLabel='QKC Token' type='text' onChange={this.handleChange} value={this.state.tokenAddress2} />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount21' nameLabel='Hold Amount 1' type='text' onChange={this.handleChange} value={this.state.holdAmount21}  />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount22' nameLabel='Hold Amount 2' type='text' onChange={this.handleChange} value={this.state.holdAmount22}  />
                </Col>
                <Col md={3}>
                  <InputField id='holdAmount23' nameLabel='Hold Amount 3' type='text' onChange={this.handleChange} value={this.state.holdAmount23}  />
                </Col>
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
                  this.state.userList.length !== 0 &&
                  <div>
                      {/* <table className='table table-striped table-bordered table-responsive'>
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
                          this.state.userList.map((val, key) => (
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
                      </table> */}
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
