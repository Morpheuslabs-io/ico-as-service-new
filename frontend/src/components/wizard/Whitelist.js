import React, {Component} from 'react';
import {Row, Col} from 'reactstrap';
import InputField from './InputField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Papa from 'papaparse';

import {setError, setStep3} from '../../redux/actions';
import {isValidAddress} from './Utils';
import SweetAlert from 'sweetalert-react';

class Whitelist extends Component {

  state = {
    w_address: '',
    w_min: 0,
    w_max: 0,
    errorWAddress: '',
    errorWMin: '',
    errorWMax: '',
    alertShow: false,
    alertTitle: '',
    alertText: '',
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  };

  handleBlurAddress = () => {
    const w_address = this.state.w_address;
    let errorWAddress = '';
    if (w_address === '' || !isValidAddress(w_address))
      errorWAddress = 'The inserted address is invalid';
    else
      errorWAddress = '';
    this.setState({
      errorWAddress,
    });
  };

  handleBlurMin = () => {
    const w_min = parseFloat(this.state.w_min);
    const w_max = parseFloat(this.state.w_max);
    let errorWMin = '';
    let errorWMax = '';
    if (!w_min || w_min <= 0) {
      errorWMin = 'Please enter a valid number greater than 0';
    } else if (w_min > w_max) {
      errorWMin = 'Should be less or equal than max';
      errorWMax = 'Should be greater or equal than min';
    } else if (w_min > 0 && w_min <= w_max) {
      errorWMin = '';
      errorWMax = '';
    } else
      errorWMin = '';
    this.setState({
      errorWMin,
      errorWMax,
    });
  };

  handleBlurMax = () => {
    const w_min = parseFloat(this.state.w_min);
    const w_max = parseFloat(this.state.w_max);
    let errorWMin = '';
    let errorWMax = '';
    if (!w_max || w_max < 0) {
      errorWMax = 'Please enter a valid number greater than 0';
    } else if (w_min > w_max) {
      errorWMin = 'Should be less or equal than max';
      errorWMax = 'Should be greater or equal than min';
    } else if (w_max > 0 && w_min <= w_max) {
      errorWMin = '';
      errorWMax = '';
    } else
      errorWMax = '';
    this.setState({
      errorWMin,
      errorWMax,
    });
  };

  handleAddWhitelist = () => {
    const w_address = this.state.w_address;
    const w_min = parseFloat(this.state.w_min);
    const w_max = parseFloat(this.state.w_max);
    let errorWAddress = '';
    let errorWMin = '';
    let errorWMax = '';

    let hasError = false;
    if (w_address === '' || !isValidAddress(w_address)) {
      errorWAddress = 'The inserted address is invalid';
      hasError = true;
    } else
      errorWAddress = '';

    if (!w_min || w_min <= 0) {
      errorWMin = 'Please enter a valid number greater than 0';
      hasError = true;
    } else if (w_min > w_max) {
      errorWMin = 'Should be less or equal than max';
      errorWMax = 'Should be greater or equal than min';
      hasError = true;
    } else if (w_min > 0 && w_min <= w_max) {
      errorWMin = '';
      errorWMax = '';
    } else
      errorWMin = '';

    if (!w_max || w_max < 0) {
      errorWMax = 'Please enter a valid number greater than 0';
      hasError = true;
    } else if (w_min > w_max) {
      errorWMin = 'Should be less or equal than max';
      errorWMax = 'Should be greater or equal than min';
      hasError = true;
    } else if (w_max > 0 && w_min <= w_max) {
      errorWMin = '';
      errorWMax = '';
    } else
      errorWMax = '';

    this.setState({
      errorWAddress,
      errorWMin,
      errorWMax,
    });

    if (!hasError) {
      this.addWhitelist(w_address, w_min, w_max);
    }
    this.setState({
      w_address: '',
      w_min: '',
      w_max: '',
      errorWAddress: '',
      errorWMin: '',
      errorWMax: '',
    });
  };

  addWhitelist = (w_address, w_min, w_max) => {
    const {id, step3, setStep3} = this.props;
    let canAdd = true;
    const whitelist = step3.tiers[id - 1].whitelist;
    for (let idx in whitelist) {
      if (whitelist[idx].w_address === w_address || w_min > w_max) {
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
      step3.tiers[id - 1].whitelist = [
        ...step3.tiers[id - 1].whitelist,
        {
          w_address: w_address,
          w_min: w_min,
          w_max: w_max,
        }
      ];
      setStep3({
        ...step3
      });
    }
  };

  handleRemoveWhitelist = (evt) => {
    let {step3, setStep3, id} = this.props;
    let whitelist = [];
    for (const idx in step3.tiers[id - 1].whitelist) {
      if (idx !== evt.target.id)
        whitelist.push(step3.tiers[id - 1].whitelist[idx]);
    }
    let tiers = step3.tiers;
    tiers[id - 1].whitelist = whitelist;

    setStep3({
      ...step3,
      tiers,
    });
  };

  handleRemoveAllWhitelist = () => {
    let {step3, setStep3, id} = this.props;
    let whitelist = [];
    let tiers = step3.tiers;
    tiers[id - 1].whitelist = whitelist;
    setStep3({
      ...step3,
      tiers,
    });
  };

  handleUploadCSV = event => {
    const {id, step3} = this.props;
    const file = event.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        let csv = Papa.parse(fileReader.result);
        for (const idx in csv.data)
          if (isValidAddress(csv.data[idx][0]))
            this.addWhitelist(csv.data[idx][0], parseFloat(csv.data[idx][1]), parseFloat(csv.data[idx][2]));
        this.setState({
          alertTitle: 'Whitelist addresses imported',
          alertText: step3.tiers[id - 1].whitelist.length + ' addresses were added to the whitelist',
          alertShow: true,
        });
      };
      fileReader.readAsText(file);
      event.target.value = null;
    }
  };

  render() {
    const {step3, id} = this.props;
    const whitelist = step3.tiers[id - 1].whitelist;
    return (
      <div>
        <p className='wg-label fs-22px'>WhiteList</p>
        <Row>
          <Col md={5}>
            <InputField id='w_address' nameLabel='Address' type='text' onChange={this.handleChange} value={this.state.w_address}
                        description="Address of a whitelisted account. Whitelists are inherited. E.g., if an account whitelisted on Tier 1 and didn't buy max cap on Tier 1, he can buy on Tier 2, and following tiers."
                        onBlur={this.handleBlurAddress} hasError={this.state.errorWAddress}/>
          </Col>
          <Col md={3}>
            <InputField id='w_min' nameLabel='Min' type='number' onChange={this.handleChange} value={this.state.w_min}
                        description="Minimum amount tokens to buy. Not a minimal size of a transaction. If minCap is 1 and user bought 1 token in a previous transaction and buying 0.1 token it will allow him to buy."
                        onBlur={this.handleBlurMin} hasError={this.state.errorWMin}/>
          </Col>
          <Col md={3}>
            <InputField id='w_max' nameLabel='Max' type='number' onChange={this.handleChange} value={this.state.w_max}
                        description="Maximum is the hard limit." onBlur={this.handleBlurMax} hasError={this.state.errorWMax}/>
          </Col>
          <Col md={1}>
            <IconButton component='span' className='add-whitelist' onClick={this.handleAddWhitelist}><i className='fas fa-plus'/></IconButton>
          </Col>
        </Row>
        <div>
          <input id={'upload-csv' + id} className='upload-csv' multiple type='file' accept=".csv" onChange={this.handleUploadCSV}/>
          <label htmlFor={'upload-csv' + id}>
            <Button variant="contained" component='span' className='upload-btn'>
              <i className='fas fa-upload'/>
              &nbsp; Upload CSV
            </Button>
          </label>
          <a className='float-right' href='/wl_sample.csv'>Download Sample CSV</a>
        </div>
        {
          whitelist.length !== 0 &&
          <div>
            <table className='table table-striped mt-3'>
              <thead>
              <tr>
                <th>Address</th>
                <th>Min</th>
                <th>Max</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              {
                whitelist.map((val, key) => (
                  <tr key={key}>
                    <td>{val.w_address}</td>
                    <td>{val.w_min}</td>
                    <td>{val.w_max}</td>
                    <td><i className='far fa-trash-alt small cursor-pointer float-right' onClick={this.handleRemoveWhitelist} id={key}/></td>
                  </tr>
                ))
              }
              </tbody>
            </table>
            <div className='float-right small cursor-pointer' onClick={this.handleRemoveAllWhitelist}><i className='far fa-trash-alt'/> Clear All</div>
          </div>
        }
        <SweetAlert show={this.state.alertShow} type='success' title={this.state.alertTitle} text={this.state.alertText} onConfirm={() => this.setState({alertShow: false})}/>
      </div>
    );
  }
}

Whitelist.propTypes = {
  id: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    step3: state.rootReducer.step3,
    error: state.rootReducer.error,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setStep3: bindActionCreators(setStep3, dispatch),
    setError: bindActionCreators(setError, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Whitelist);