import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import HighChart from 'react-highcharts';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux';

let web3 = null;
if (typeof(window.web3) !== 'undefined') {
  web3 = window.web3;
}

class Invest extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    let config = {
      chart: {
        renderTo: 'sale-time-chart',
        type: 'pie',
        height: 280,
        width: 280,
        borderRadius: 0
      },
      credits: {
        enabled: false
      },
      title: false,
      tooltip: false,
      plotOptions: {
        pie: {
          borderWidth: 5,
          startAngle: 0,
          innerSize: '60%',
          size: '100%',
          shadow: true,
          dataLabels: false,
          stickyTracking: false,
          point: {
            events: {
              mouseOver: function () {

              },
              mouseOut: function () {

              }
            }
          }
        }
      },

      series: [{
        data: [
          {y: 100, color: '#05ACFF'},
        ]
      }]
    };

    let {step2, step3, deploy} = this.props;

    let totalSupply = 0;
    for (let i=0; i<step3.tiers.length; i++)
      totalSupply += parseFloat(step3.tiers[i].supply);

    return (
      <div className='page-content wizard'>
        <div className='page-wrapper d-flex flex-column'>
          <div className='step-content'>
            <div className='container step-widget pt-0'>
              <Row>
                <Col className='invest-left' md={8}>
                  <HighChart config={config}/>
                  <div>
                    <p className='wg-text mb-0'>{web3.eth.accounts[0]}</p>
                    <p className='wg-description'>Current Account</p>
                  </div>
                  <div>
                    <p className='wg-text mb-0'>{deploy.token != false && deploy.token}</p>
                    <p className='wg-description'>Token Address</p>
                  </div>
                  <div>
                    {
                      deploy.d_tiers.map((val, key) => (
                        <p className='wg-text mb-0' key={key}>{val.crowdsale}</p>
                      ))
                    }
                    <p className='wg-description'>Crowdsale Contract Address</p>
                  </div>
                  <Row>
                    <Col sm={4}>
                      <p className='wg-text mb-0'>{step2.name}</p>
                      <p className='wg-description'>Name</p>
                    </Col>
                    <Col sm={4}>
                      <p className='wg-text mb-0'>{step2.ticker}</p>
                      <p className='wg-description'>Ticker</p>
                    </Col>
                    <Col sm={4}>
                      <p className='wg-text mb-0'>{totalSupply} {step2.ticker}</p>
                      <p className='wg-description'>Total Supply</p>
                    </Col>
                  </Row>
                </Col>
                <Col md={4} className='invest-right pl-0'>
                  <div className='invest-balance-1'>
                    <label className='wg-label'>Your Balance in Tokens</label>
                    <div className='d-flex justify-content-between'>
                      <span className='wg-bold-text'>0</span>
                      <span className='wg-bold-text' style={{color: '#999999'}}>{step2.ticker}</span>
                    </div>
                    <div className='wg-description'>Balance</div>
                  </div>
                  <div className='invest-balance-2'>
                    <label className='wg-label'>Choose Amount to Invest</label>
                    <Input className='balance-input' defaultValue={0} type="number" margin="normal"
                           endAdornment={<InputAdornment position="end">TOKEN</InputAdornment>}/>
                    <select className='form-control wallet-method'>
                      <option value='metamask'>Metamask</option>
                      <option value='metamask'>QR</option>
                    </select>
                    <Button color='primary' variant="contained" component='span' className='form-control contribute-btn'>Contribute</Button>
                    <p className='wg-description mt-5'>Think twice before contributing to Crowdsales. Tokens will be deposited on a wallet you used to buy tokens.</p>
                  </div>
                </Col>
              </Row>
              <div className='wg-content invest-bottom'>
                <div className='wg-label'>Invest Page</div>
                <div className='wg-description'>Here you can invest in the crowdsale campaign. At the moment, you need Metamask client to invest into crowdsale. If you don’t have Metamask, you can send ethers to the crowdsale address with a MethodID: 0xaa6f2ae3a. Sample transaction on Rinkeby network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step2: state.rootReducer.step2,
    step3: state.rootReducer.step3,
    deploy: state.rootReducer.deploy,
  }
}

export default connect(mapStateToProps)(Invest);