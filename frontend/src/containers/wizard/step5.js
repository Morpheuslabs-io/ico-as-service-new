import React, {Component} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {connect} from 'react-redux';

import step5Asset from '../../assets/img/step5.svg';
import {Row, Col} from 'reactstrap';
import Button from '@material-ui/core/Button';

class Step5 extends Component {

  render() {
    const {deploy, step3} = this.props;

    let totalSupply = 0;
    for (let i=0; i<step3.tiers.length; i++)
      totalSupply += parseFloat(step3.tiers[i].supply);

    return (
      <div className='step-content'>
        <div className='container step-widget'>
          <div className='widget-header border-bottom'>
            <img src={step5Asset}/>
            <div>
              <p className='title'>CROWDSALE PAGE</p>
              <p className='description'>Page with statistics of crowdsale. Statistics for all tiers combined on the page.
              </p>
            </div>
          </div>
          <div className='wg-content'>
            <div className='pro-bar'>
              <div className='pro-bar-back'>
                <div className='pro-front' style={{width: '50%'}}></div>
              </div>
              <div className='d-flex justify-content-between'>
                <span>0 Eth</span>
                <span>10000 Eth</span>
              </div>
            </div>
            <div className='wg-description d-flex justify-content-between'>
              <span>Total Raised Funds</span>
              <span>Goal</span>
            </div>
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='wg-content pt-0'>
            <Row>
              <Col sm={3}>
                <p className='wg-text mb-0'>0</p>
                <p className='wg-description'>Tokens Claimed</p>
              </Col>
              <Col sm={3}>
                <p className='wg-text mb-0'>0</p>
                <p className='wg-description'>Contributors</p>
              </Col>
              <Col sm={3}>
                <p className='wg-text mb-0'>{step3.tiers[0].rate}</p>
                <p className='wg-description'>Price (Tokens/ETH)</p>
              </Col>
              <Col sm={3}>
                <p className='wg-text mb-0'>{totalSupply}</p>
                <p className='wg-description'>Total Supply</p>
              </Col>
            </Row>
            <div>
              <p className='wg-text mb-0'>{step3.wallet_address}</p>
              <p className='wg-description'>Wallet Address</p>
            </div>
            <div>
              <p className='wg-text mb-0'>{step3.email_address}</p>
              <p className='wg-description'>Email Address</p>
            </div>
            <div>
              <p className='wg-text mb-0'>{deploy.d_tiers[0].token}</p>
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
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    deploy: state.rootReducer.deploy,
    step3: state.rootReducer.step3,
  }
}

export default connect(mapStateToProps)(Step5);