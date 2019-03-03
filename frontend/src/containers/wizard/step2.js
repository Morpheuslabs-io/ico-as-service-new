import React, {Component} from 'react';
import Radio from '@material-ui/core/Radio';
import Button from '@material-ui/core/Button';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Papa from 'papaparse';
import SweetAlert from 'sweetalert-react';

import 'sweetalert/dist/sweetalert.css';

import {setError, setStep2} from '../../redux/actions';
import step2Asset from '../../assets/img/step2.svg';
import InputField from '../../components/wizard/InputField';
import {isValidAddress} from '../../components/wizard/Utils';

let web3 = null;
if (typeof(window.web3) !== 'undefined') {
  web3 = window.web3;
}

class Step2 extends Component {

  state = {
    address: '',
    dimension: 'tokens',
    tokenAmount: 0,
    errorAddress: '',
    errorTokenAmount: '',
    alertShow: false,
    alertTitle: '',
    alertText: '',
  };

  handleChangeDimension = event => {
    this.setState({dimension: event.target.value});
  };

  handleChange = (name, value) => {
    if (name === 'address' || name === 'tokenAmount') {
      this.setState({[name]: value});
    }
    else
      this.props.setStep2({
        ...this.props.step2,
        [name]: value
      });
  };

  handleSubmitReservedToken = () => {
    if (this.state.address === '') {
      this.setState({
        errorAddress: 'This field is required',
      });
      return;
    }
    else
      this.setState({
        errorAddress: '',
      });
    if (!isValidAddress(this.state.address)) {
      this.setState({
        errorAddress: 'Address is not valid',
      });
      return;
    }

    if (this.state.tokenAmount === '' || this.state.tokenAmount <= 0) {
      this.setState({
        errorTokenAmount: 'Value must be positive and decimals should not exceed the amount of decimals specified',
      });
      return;
    }
    else
      this.setState({
        errorTokenAmount: '',
      });
    this.addReservedToken(this.state.address, this.state.dimension, this.state.tokenAmount);
    this.setState({
      address: '',
      dimension: 'tokens',
      tokenAmount: 0,
    });
  };

  addReservedToken = (address, dimension, tokenAmount) => {
    console.log(address, dimension, tokenAmount);
    let {step2, setStep2} = this.props;
    let canAdd = true;
    for (let id in step2.reserved_token) {
      if (step2.reserved_token[id].address === address && step2.reserved_token[id].dimension === dimension && step2.reserved_token[id].tokenAmount === parseFloat(tokenAmount)) {
        canAdd = false;
        break;
      }
    }
    if (typeof address === 'undefined' || typeof dimension === 'undefined' || typeof tokenAmount === 'undefined' || address === '' || dimension === '' || tokenAmount === '' || parseFloat(tokenAmount) <= 0)
      canAdd = false;

    if (canAdd) {
      setStep2({
        ...step2,
        reserved_token: [
          ...step2.reserved_token,
          {
            address: address,
            dimension: dimension,
            tokenAmount: parseFloat(tokenAmount),
          }
        ]
      });
    }
  };

  handleBlurName = () => {
    if (this.props.step2.name === '')
      this.props.setError({
        ...this.props.error,
        errorName: 'This field is required',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorName: '',
      });
  };

  handleBlurTicker = () => {
    if (this.props.step2.ticker === '')
      this.props.setError({
        ...this.props.error,
        errorTicker: 'This field is required',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorTicker: '',
      });
    if (this.props.step2.ticker.length > 5)
      this.props.setError({
        ...this.props.error,
        errorTicker: 'Please enter a valid ticker between 1-5 characters',
      });
    if (this.props.step2.ticker !== '' && !(/^[a-z0-9]+$/i.test(this.props.step2.ticker)))
      this.props.setError({
        ...this.props.error,
        errorTicker: 'Only alphanumeric characters',
      });
  };

  handleBlurDecimals = () => {
    if (this.props.step2.decimals === '')
      this.props.setError({
        ...this.props.error,
        errorDecimals: 'This field is required',
      });
    else
      this.props.setError({
        ...this.props.error,
        errorDecimals: '',
      });
    if (this.props.step2.decimals > 18)
      this.props.setError({
        ...this.props.error,
        errorDecimals: 'Should not be greater than 18',
      });
    if (this.props.step2.decimals < 0)
      this.props.setError({
        ...this.props.error,
        errorDecimals: 'Should not be less than 0',
      });
  };

  handleRemoveReservedToken = (evt) => {
    let {step2, setStep2} = this.props;
    let reserved_token = [];
    for (const id in step2.reserved_token) {
      if (id !== evt.target.id)
        reserved_token.push(step2.reserved_token[id]);
    }

    setStep2({
      ...step2,
      reserved_token
    });
  };

  handleRemoveAllReservedToken = () => {
    let {step2, setStep2} = this.props;
    setStep2({
      ...step2,
      reserved_token: []
    });
  };

  handleUploadCSV = event => {
    const file = event.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        let csv = Papa.parse(fileReader.result);
        for (const id in csv.data)
          if(isValidAddress(csv.data[id][0]))
            this.addReservedToken(csv.data[id][0], csv.data[id][1], csv.data[id][2]);
        this.setState({
          alertTitle: 'Reserved tokens imported',
          alertText: this.props.step2.reserved_token.length + ' addresses are reserved',
          alertShow: true,
        });
      };
      fileReader.readAsText(file);
      event.target.value = null;
    }
  };

  render() {
    const {name, ticker, decimals, reserved_token} = this.props.step2;
    return (
      <div className='step-content'>
        <div className='container step-widget'>
          <div className='widget-header'>
            <img src={step2Asset}/>
            <div>
              <p className='title'>Token Setup</p>
              <p className='description'>Configure properties of your token. Created token contract will be ERC-20 compatible.</p>
            </div>
          </div>
          <div className='wg-content'>
            <InputField id='name' nameLabel='Name' type='text' onChange={this.handleChange} value={name}
                        description='Modern crowdsale strategy with multiple tiers, whitelists, and limits. Recommended for every crowdsale.'
                        onBlur={this.handleBlurName} hasError={this.props.error.errorName}
            />
            <InputField id='ticker' nameLabel='Ticker' type='text' onChange={this.handleChange} value={ticker}
                        description='The five letter ticker for your token. There are 11,881,376 combinations for 26 english letters. Be hurry.'
                        onBlur={this.handleBlurTicker} hasError={this.props.error.errorTicker}
            />
            <InputField id='decimals' nameLabel='Decimals' type='number' onChange={this.handleChange} value={decimals}
                        description='Refers to how divisible a token can be, from 0 (not at all divisible) to 18 (pretty much continuous).'
                        onBlur={this.handleBlurDecimals} hasError={this.props.error.errorDecimals}
            />
          </div>
        </div>
        <div className='container step-widget widget-2'>
          <div className='widget-header'>
            <p className='title'>Reserved Tokens</p>
          </div>
          <div className='wg-content border-bottom'>
            <InputField id='address' nameLabel='Address' type='text' onChange={this.handleChange} value={this.state.address}
                        description='Address where to send reserved tokens.' hasError={this.state.errorAddress}
            />
            <div>
              <label className='wg-label'>Dimemsion</label>
              <div>
                <Radio
                  checked={this.state.dimension === 'tokens'}
                  onChange={this.handleChangeDimension}
                  value='tokens' color='primary' id='tokens' classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='tokens'>Tokens</label>
                <Radio
                  checked={this.state.dimension === 'percentage'}
                  onChange={this.handleChangeDimension}
                  value='percentage' color='primary' id='percentage' classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='percentage'>Percentages</label>
                <p className='wg-description'>Fixed amount or % of crowdsaled tokens. Will be deposited to the account after finalization of the crowdsale.</p>
              </div>
            </div>
            <InputField id='tokenAmount' nameLabel='Value' type='number' onChange={this.handleChange} value={this.state.tokenAmount}
                        description="Value in tokens. Don't forget to click + button for each reserved token." hasError={this.state.errorTokenAmount}
            />
            <div>
              <input id='upload-csv' multiple type='file' accept=".csv" onChange={this.handleUploadCSV}/>
              <label htmlFor='upload-csv'>
                <Button variant="contained" component='span' className='upload-btn'>
                  <i className='fas fa-upload'/>
                  &nbsp; Upload CSV
                </Button>
              </label>
              <a className='float-right' href='/sample.csv'>Download Sample CSV</a>
            </div>
          </div>
          <div className='wg-btn'>
            <Button variant='contained' size='large' color="primary" className='submit-btn' onClick={this.handleSubmitReservedToken}>
              Submit
            </Button>
          </div>
          {
            reserved_token.length !== 0 &&
            <div className='pb-5 pl-5 pr-5'>
              <table className='table table-striped'>
                <thead>
                <tr>
                  <th>Address</th>
                  <th>Dimension</th>
                  <th>Value</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                {
                  reserved_token.map((val, key) => (
                    <tr key={key}>
                      <td>{val.address}</td>
                      <td>{val.dimension}</td>
                      <td>{val.tokenAmount}</td>
                      <td><i className='far fa-trash-alt small cursor-pointer float-right' onClick={this.handleRemoveReservedToken} id={key}/></td>
                    </tr>
                  ))
                }
                </tbody>
              </table>
              <div className='float-right small cursor-pointer' onClick={this.handleRemoveAllReservedToken}><i className='far fa-trash-alt'/> Clear All</div>
            </div>
          }
        </div>
        <SweetAlert show={this.state.alertShow} type='success' title={this.state.alertTitle} text={this.state.alertText} onConfirm={() => this.setState({alertShow: false})}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step2: state.rootReducer.step2,
    error: state.rootReducer.error,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep2: bindActionCreators(setStep2, dispatch),
    setError: bindActionCreators(setError, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Step2);