import React, {Component} from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import {Row, Col} from 'reactstrap';
import {bindActionCreators} from 'redux';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

import step4Asset from '../../assets/img/step4.svg';
import {setDeploy, setStep} from "../../redux/actions";
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import SafeMathLibExt from '../../artifacts/SafeMathLibExt';
import CrowdsaleTokenExt from '../../artifacts/CrowdsaleTokenExt';
import FlatPricingExt from '../../artifacts/FlatPricingExt';
import ReservedTokensFinalizeAgent from '../../artifacts/ReservedTokensFinalizeAgent';
import MintedTokenCappedCrowdsaleExt from '../../artifacts/MintedTokenCappedCrowdsaleExt';

class Step4 extends Component {

  state = {
    showModal: true,
  };

  componentDidMount = () => {
    const {setDeploy, deploy} = this.props;

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
      ...deploy,
      safemath: false,
      token: false,
      crowdsale_address: false,
      reserve_token: false,
      vesting: false,
      ownership: false,
      // d_tiers: [
      //   TIER_DEPLOY_INITIAL_VALUES,
      // ]
    });
  };

  handleCloseModal = () => {
    this.setState({
      showModal: false,
    });
  };

  handleCancel = () => {
    const {wizard, setStep} = this.props;
    setStep(wizard.step - 1);
  };

  handleDownloadContracts = () => {
    let {name, ticker} = this.props.step2;
    ticker = capitalizeString(ticker);
    let zip = new JSZip();
    let dir = zip.folder(name + ' Contracts');

    let prefixABI = '======================================================= Contract ABI =======================================================\n\n';

    dir.file("01. SafeMathLibExt.sol", SafeMathLibExt.source);
    dir.file("01. SafeMathLibExt.txt", prefixABI + JSON.stringify(SafeMathLibExt.abi));

    const tokenSource = CrowdsaleTokenExt.source.replace('contract CrowdsaleTokenExt', `contract ${ticker}TokenExt`);
    dir.file(`02. ${ticker}TokenExt.sol`, tokenSource);
    dir.file(`02. ${ticker}TokenExt.txt`, prefixABI + JSON.stringify(CrowdsaleTokenExt.abi));

    dir.file("03. FlatPricingExt.sol", FlatPricingExt.source);
    dir.file("03. FlatPricingExt.txt", prefixABI + JSON.stringify(FlatPricingExt.abi));

    dir.file("04. ReservedTokensFinalizeAgent.sol", ReservedTokensFinalizeAgent.source);
    dir.file("04. ReservedTokensFinalizeAgent.txt", prefixABI + JSON.stringify(ReservedTokensFinalizeAgent.abi));

    const tokenSaleSource = MintedTokenCappedCrowdsaleExt.source.replace('contract MintedTokenCappedCrowdsaleExt', `contract ${ticker}CrowdsaleExt`);
    dir.file(`05. ${ticker}CrowdsaleExt.sol`, tokenSaleSource);
    dir.file(`05. ${ticker}CrowdsaleExt.txt`, prefixABI + JSON.stringify(MintedTokenCappedCrowdsaleExt.abi));

    zip.generateAsync({type:"blob"})
      .then(function(content) {
        FileSaver.saveAs(content, "contracts.zip");
      });
  };

  render() {
    const {name, ticker, decimals, reserved_token} = this.props.step2;
    const {wallet_address, gasPrice, mincap, enableWhitelisting, tiers} = this.props.step3;
    const {vestings} = this.props.step5;
    const {safemath, token, crowdsale_address, reserve_token, vesting, ownership, d_tiers} = this.props.deploy;

    return (
      <div className='step-content'>
        <div className='container step-widget'>
          <div className='widget-header'>
            <img src={step4Asset}/>
            <div>
              <p className='title'>Publish</p>
              <p className='description'>On this step we provide you artifacts about your token and crowdsale contracts.
                They are useful to verify contracts source code on <a href='https://etherscan.io/verifyContract' className='wg-link'>Etherscan</a>
              </p>
            </div>
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>1. CROWDSALE CONTRACT</p>
          </div>
          <div className='wg-content border-bottom'>
            <div>
              <label className='wg-label'>WHITELIST WITH CAP</label>
              <p className='wg-text'>Whitelist With Cap</p>
              <p className='wg-description'>Crowdsale Contract</p>
            </div>
            <div>
              <label className='wg-label'>Wallet Address</label>
              <p className='wg-text'>{wallet_address}
                <CopyToClipboard text={wallet_address}>
                  <IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton>
                </CopyToClipboard>
              </p>
              <p className='wg-description'>Where the money goes after investors transactions.</p>
            </div>
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>2. Token Setup</p>
          </div>
          <div className='wg-content border-bottom'>
            <div>
              <label className='wg-label'>Name</label>
              <p className='wg-text'>{name}
                <CopyToClipboard text={name}>
                  <IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton>
                </CopyToClipboard>
              </p>
              <p className='wg-description'>The name of your token. Will be used by Etherscan and other token browsers.</p>
            </div>
            <Row>
              <Col md={5}>
                <label className='wg-label'>Ticker</label>
                <p className='wg-text'>{ticker}
                  <CopyToClipboard text={ticker}>
                    <IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton>
                  </CopyToClipboard>
                </p>
                <p className='wg-description'>The five letter ticker for your token.</p>
              </Col>
              <Col md={{size: 5, offset: 2}}>
                <label className='wg-label'>Decimals</label>
                <p className='wg-text'>{decimals}
                  <CopyToClipboard text={decimals}>
                    <IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton>
                  </CopyToClipboard>
                </p>
                <p className='wg-description'>The decimals of your token.</p>
              </Col>
            </Row>
          </div>
        </div>

        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>4. CROWDSALE SETUP</p>
          </div>
          <div className='wg-content border-bottom'>
            <Row>
              <Col md={5}>
                <label className='wg-label'>COMPILER VERSION</label>
                <p className='wg-text'>0.4.19
                  <CopyToClipboard text='0.4.19'><IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
                </p>
                <p className='wg-description'>Compiler Version</p>
              </Col>
              <Col md={{size: 5, offset: 2}}>
                <label className='wg-label'>OPTIMIZED</label>
                <p className='wg-text'>True
                  <CopyToClipboard text='True'><IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
                </p>
                <p className='wg-description'>Optimization in compiling</p>
              </Col>
            </Row>
            <Row>
              <Col md={5}>
                <label className='wg-label'>CONTRACT NAME</label>
                <p className='wg-text'>MintedTokenCappedCrowdsaleExt
                  <CopyToClipboard text='MintedTokenCappedCrowdsaleExt'><IconButton component='span' className='float-right'><i
                    className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
                </p>
                <p className='wg-description'>Crowdsale contract name</p>
              </Col>
            </Row>
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>5. GLOBAL LIMITS</p>
          </div>
          <div className='wg-content border-bottom'>
            <div>
              <label className='wg-label'>Min Cap</label>
              <p className='wg-text'>{mincap}
                <CopyToClipboard text={mincap}><IconButton component='span' className='float-right'><i className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              </p>
              <p className='wg-description'>Min Cap for all investors</p>
            </div>
            <div>
              <label className='wg-label'>TOKEN CONTRACT SOURCE CODE</label>
              <CopyToClipboard text={CrowdsaleTokenExt.source}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={CrowdsaleTokenExt.source}/>
              <p className='wg-description'>Token Contract Source Code</p>
            </div>
            <div>
              <label className='wg-label'>TOKEN CONTRACT ABI</label>
              <CopyToClipboard text={JSON.stringify(CrowdsaleTokenExt.abi)}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={JSON.stringify(CrowdsaleTokenExt.abi)}/>
              <p className='wg-description'>Token Contract ABI</p>
            </div>
            <div>
              <label className='wg-label'>TOKEN CONSTRUCTOR ARGUMENTS (ABI-ENCODED AND APPENDED TO THE BYTECODE ABOVE)</label>
              <CopyToClipboard text={CrowdsaleTokenExt.bytecode}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={CrowdsaleTokenExt.bytecode}/>
              <p className='wg-description'>Token Constructor Arguments</p>
            </div>
            <div>
              <label className='wg-label'>PRICING STRATEGY CONTRACT SOURCE CODE</label>
              <CopyToClipboard text={FlatPricingExt.source}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={FlatPricingExt.source}/>
              <p className='wg-description'>Pricing Strategy Contract Source Code</p>
            </div>
            <div>
              <label className='wg-label'>PRICING STRATEGY CONTRACT ABI</label>
              <CopyToClipboard text={JSON.stringify(FlatPricingExt.abi)}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={JSON.stringify(FlatPricingExt.abi)}/>
              <p className='wg-description'>Pricing Strategy Contract ABI</p>
            </div>
            <div>
              <label className='wg-label'>CONSTRUCTOR ARGUMENTS FOR TIER 1 PRICING STRATEGY CONTRACT (ABI-ENCODED AND APPENDED TO THE BYTECODE ABOVE)</label>
              <CopyToClipboard text={FlatPricingExt.bytecode}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={FlatPricingExt.bytecode}/>
              <p className='wg-description'>Token Constructor Arguments</p>
            </div>
            <div>
              <label className='wg-label'>FINALIZE AGENT CONTRACT SOURCE CODE</label>
              <CopyToClipboard text={ReservedTokensFinalizeAgent.source}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={ReservedTokensFinalizeAgent.source}/>
              <p className='wg-description'>Finalize Agent Contract Source Code</p>
            </div>
            <div>
              <label className='wg-label'>FINALIZE AGENT CONTRACT ABI</label>
              <CopyToClipboard text={JSON.stringify(ReservedTokensFinalizeAgent.abi)}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={JSON.stringify(ReservedTokensFinalizeAgent.abi)}/>
              <p className='wg-description'>Finalize Agent Contract ABI</p>
            </div>
            <div>
              <label className='wg-label'>CONSTRUCTOR ARGUMENTS FOR TIER 1 FINALIZE AGENT CONTRACT (ABI-ENCODED AND APPENDED TO THE BYTECODE ABOVE)</label>
              <CopyToClipboard text={ReservedTokensFinalizeAgent.bytecode}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={ReservedTokensFinalizeAgent.bytecode}/>
              <p className='wg-description'>Constructor arguments for finalize agent contract</p>
            </div>
            <div>
              <label className='wg-label'>CROWDSALE CONTRACT SOURCE CODE</label>
              <CopyToClipboard text={MintedTokenCappedCrowdsaleExt.source}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={MintedTokenCappedCrowdsaleExt.source}/>
              <p className='wg-description'>Crowdsale Contract Source Code</p>
            </div>
            <div>
              <label className='wg-label'>CROWDSALE CONTRACT ABI</label>
              <CopyToClipboard text={JSON.stringify(MintedTokenCappedCrowdsaleExt.abi)}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={JSON.stringify(MintedTokenCappedCrowdsaleExt.abi)}/>
              <p className='wg-description'>Crowdsale Contract ABI</p>
            </div>
            <div>
              <label className='wg-label'>CONSTRUCTOR ARGUMENTS FOR TIER 1 (ABI-ENCODED AND APPENDED TO THE BYTECODE ABOVE)</label>
              <CopyToClipboard text={MintedTokenCappedCrowdsaleExt.bytecode}><IconButton component='span' className='float-right'><i
                className='fas fa-pencil-alt copy-pencil'/></IconButton></CopyToClipboard>
              <textarea className='form-control bg-white' rows={5} readOnly={true} value={MintedTokenCappedCrowdsaleExt.bytecode}/>
              <p className='wg-description'>Encoded ABI</p>
            </div>
          </div>
        </div>
        <div className='container'>
          <Button href='/contracts.zip' color='primary' variant="contained" component='span' className='additional-btn' onClick={this.handleDownloadContracts}>Download File</Button>
        </div>
        <ReactModal
          isOpen={this.state.showModal}
          ariaHideApp={false}>
          <h3>DEPLOYMENT PIPELINE</h3>
          <table className='table table-striped'>
            <thead>
            <tr>
              <th>Tx Name</th>
              {
                tiers.map((val, key) => (
                  <th key={key}>{val.tierName}</th>
                ))
              }
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Deploy SafeMathLibrary Contract</td>
              {
                d_tiers.map((val, key) => (
                  key === 0 ? (<td><i className={'far ' + (safemath ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                ))
              }
            </tr>
            <tr>
              <td>Deploy Token Contract</td>
              {
                d_tiers.map((val, key) => (
                  key === 0 ? (<td><i className={'far ' + (token ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                ))
              }
            </tr>
            <tr>
              <td>Deploy Pricing Strategy Contract</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.pricing_strategy ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Deploy Crowdsale Contract</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.crowdsale ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Associate Crowdsale address to current account</td>
              {
                d_tiers.map((val, key) => (
                  key === 0 ? (<td><i className={'far ' + (crowdsale_address ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                ))
              }
            </tr>
            <tr>
              <td>Deploy Finalize Agent Contract</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.finalize_agent ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Register tier address for Pricing strategy</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.register_tiers ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            {
              reserved_token.length !== 0 &&
              <tr>
                <td>Register addresses for Reserved Tokens</td>
                {
                  d_tiers.map((val, key) => (
                    key === 0 ? (<td><i className={'far ' + (reserve_token ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                  ))
                }
              </tr>
            }
            <tr>
              <td>Register Crowdsales addresses</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.register_crowdsale ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Allow Crowdsale Contract to Mint Tokens</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.allow_crowdsale ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Allow Finalize Agent Contract to Mint Token</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.allow_finalize ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            {
              enableWhitelisting === 'yes' &&
              <tr>
                <td>Register whitelisted addresses</td>
                {
                  d_tiers.map((val, key) => (
                    <td key={key}><i className={'far ' + (val.register_whitelisted ? 'fa-check' : 'fa-clock')}></i></td>
                  ))
                }
              </tr>
            }
            <tr>
              <td>Register Finalize Agent Contract addresses</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.register_finalize ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            <tr>
              <td>Register Token release addresses</td>
              {
                d_tiers.map((val, key) => (
                  <td key={key}><i className={'far ' + (val.register_token ? 'fa-check' : 'fa-clock')}></i></td>
                ))
              }
            </tr>
            {
              vestings.length !== 0 &&
              <tr>
                <td>Vesting Token</td>
                {
                  d_tiers.map((val, key) => (
                    key === 0 ? (<td><i className={'far ' + (vesting ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                  ))
                }
              </tr>
            }
            <tr>
              <td>Transfer ownership to wallet address</td>
              {
                d_tiers.map((val, key) => (
                  key === 0 ? (<td><i className={'far ' + (ownership ? 'fa-check' : 'fa-clock')}></i></td>) : (<td></td>)
                ))
              }
            </tr>
            </tbody>
          </table>
          <button className='btn upload-btn float-left' onClick={this.handleCancel}>Cancel</button>
          {
            ownership !== false &&
            <button className='btn upload-btn float-right' onClick={this.handleCloseModal}>Done</button>
          }
        </ReactModal>
      </div>
    );
  }
}

function capitalizeString(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function mapStateToProps(state) {
  return {
    wizard: state.rootReducer.wizard,
    step1: state.rootReducer.step1,
    step2: state.rootReducer.step2,
    step3: state.rootReducer.step3,
    step5: state.rootReducer.step5,
    deploy: state.rootReducer.deploy,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep: bindActionCreators(setStep, dispatch),
    setDeploy: bindActionCreators(setDeploy, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Step4);