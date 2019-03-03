import React, {Component} from 'react';
import Radio from '@material-ui/core/Radio';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import 'react-datepicker/dist/react-datepicker.css';
import InputField from './InputField';
import {setError} from '../../redux/actions';
import {diffDates} from './Utils';
import WhiteList from './Whitelist';

class TierSetup extends Component {

  constructor(props) {
    super(props);
  }

  handleChangeAllowModifying = event => {
    this.props.onChange(this.props.index, 'allowModifying', event.target.value);
  };

  handleBlurTierName = (evt) => {
    const {setError, error} = this.props;
    let {sequence} = this.props.tierData;
    let errorTiers = error.errorTiers;
    let errorTierName = '';
    if (evt.target.value === '')
      errorTierName = 'This field is required';
    errorTiers[sequence - 1] = {
      ...errorTiers[sequence - 1],
      errorTierName
    };
    setError({
      ...error,
      errorTiers
    });
  };

  handleBlurRate = (evt) => {
    const {setError, error} = this.props;
    let {sequence} = this.props.tierData;
    let errorTiers = error.errorTiers;
    let errorRate = '';
    if (evt.target.value <= 0)
      errorRate = 'Please enter a valid number greater than 0. Should be integer. Should not be greater than 1 quintillion (10^18)';
    errorTiers[sequence - 1] = {
      ...errorTiers[sequence - 1],
      errorRate
    };
    setError({
      ...error,
      errorTiers
    });
  };

  handleBlurSupply = (evt) => {
    const {setError, error} = this.props;
    let {sequence} = this.props.tierData;
    let errorTiers = error.errorTiers;
    let errorSupply = '';
    if (evt.target.value <= 0)
      errorSupply = 'Please enter a valid number greater than 0';
    errorTiers[sequence - 1] = {
      ...errorTiers[sequence - 1],
      errorSupply
    };
    setError({
      ...error,
      errorTiers
    });
  };

  handleChange = (name, value) => {
    this.props.onChange(this.props.index, name, value);
  };

  handleChangeStartDate = (date) => {
    this.props.onChange(this.props.index, 'startDate', date);
  };

  handleChangeStartTime = (date) => {
    this.props.onChange(this.props.index, 'startTime', date);
  };

  handleChangeEndDate = (date) => {
    this.props.onChange(this.props.index, 'endDate', date);
  };

  handleChangeEndTime = (date) => {
    this.props.onChange(this.props.index, 'endTime', date);
  };

  handleChangeLockDate = (date) => {
    this.props.onChange(this.props.index, 'lockDate', date);
  };

  handleChangeUnlockDate = (date) => {
    this.props.onChange(this.props.index, 'unlockDate', date);
  };

  handleBlurDateTime = () => {
    let {step3, error, setError} = this.props;
    let {sequence} = this.props.tierData;
    for (const id in step3.tiers) {
      let startError = '';
      let endError = '';
      let errorLock = '';
      let errorTiers = error.errorTiers;

      if (!step3.tiers[id].startDate || !step3.tiers[id].startTime)
        startError = 'Should not be empty';
      if (!step3.tiers[id].endDate || !step3.tiers[id].endTime)
        endError = 'Should not be empty';
      if (!step3.tiers[id].lockDate || !step3.tiers[id].unlockDate)
        errorLock = 'Should not be empty';
      if (startError || endError || errorLock)
      {
        errorTiers[sequence - 1] = {
          startError,
          endError,
          errorLock,
        };
        setError({
          ...error,
          errorTiers
        });
        return;
      }

      const diffS = diffDates(moment(), moment(), step3.tiers[id].startDate, step3.tiers[id].startTime);
      const diffE = diffDates(moment(), moment(), step3.tiers[id].endDate, step3.tiers[id].endTime);
      let diffL = diffDates(step3.tiers[id].lockDate, moment(), step3.tiers[id].unlockDate, moment());
      if (diffS <= 0 || diffE <= 0) {
        startError = diffS < 0 ? 'Should be set in the future' : '';
        endError = diffE < 0 ? 'Should be set in the future' : '';
      } else {
        let diff = diffDates(step3.tiers[id].startDate, step3.tiers[id].startTime, step3.tiers[id].endDate, step3.tiers[id].endTime);
        if (diff <= 0) {
          startError = 'Should be previous than same tier\'s End Time';
          endError = 'Should be later than same tier\'s Start Time';
        } else if (id != 0) {
          diff = diffDates(step3.tiers[id - 1].endDate, step3.tiers[id - 1].endTime, step3.tiers[id].startDate, step3.tiers[id].startTime);
          if (diff <= 0) {
            startError = 'Should be same or next than previous tier\'s End Time';
            endError = '';
          }
        }
      }
      if (diffL <= 0)
        errorLock = 'Unlock date should be next than lock date.';
      else {
        diffL = diffDates(step3.tiers[step3.tiers.length - 1].endDate, moment(), step3.tiers[id].unlockDate, moment());
        if (diffL <= 0)
          errorLock = 'Unlock date should be next than last tier\'s datetime';
        else {
          diffL = diffDates(moment(), moment(), step3.tiers[id].lockDate, moment());
          if (diffL <= 0)
            errorLock = 'Lock date should be set in the future';
        }
      }
      errorTiers[sequence - 1] = {
        startError,
        endError,
        errorLock,
      };
      setError({
        ...error,
        errorTiers
      });
    }
  };

  render() {
    const {tierName, allowModifying, startDate, startTime, endDate, endTime, lockDate, unlockDate, rate, supply, sequence} = this.props.tierData;
    const {error, step3} = this.props;
    return (
      <div className='tier-setup'>
        <div className='container step-widget widget-2'>
          <div className='wg-content border-bottom'>
            <InputField id='tierName' nameLabel='Crowdsale Setup Name' type='text' onChange={this.handleChange} value={tierName}
                        description='Name of a tier, e.g. PrePreCrowdsale, PreCrowdsale, Crowdsale with bonus A, Crowdsale with bonus B, etc. We simplified that and will increment a number after each tier.'
                        onBlur={this.handleBlurTierName} hasError={error.errorTiers[sequence - 1].errorTierName}
            />
            <div>
              <label className='wg-label'>Allow Modifying</label>
              <div>
                <Radio
                  checked={allowModifying === 'yes'}
                  onChange={this.handleChangeAllowModifying}
                  value='yes' color='primary' id='allow-modifying-yes'
                  classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='allow-modifying-yes'>Yes</label>
                <Radio
                  checked={allowModifying === 'no'}
                  onChange={this.handleChangeAllowModifying}
                  value='no' color='primary' id='allow-modifying-no'
                  classes={{root: 'primary-color', checked: 'checked'}}/>
                <label className='checkbox-label' htmlFor='allow-modifying-no'>No</label>
              </div>
              <p className='wg-description'>Pandora box feature. If it's enabled, a creator of the crowdsale can modify Start time, End time, Rate, Limit after publishing.</p>
            </div>
            <div>
              <label className='wg-label'>Start Time</label>
              <div className='d-flex dt-picker-time'>
                <DatePicker
                  selected={startDate} onChange={this.handleChangeStartDate}
                  className='form-control wg-text-field'
                  todayButton='Today' dateFormat='YYYY/MM/DD' onBlur={this.handleBlurDateTime}/>
                <div className='time-input'>
                  <DatePicker
                    selected={startTime} onChange={this.handleChangeStartTime}
                    className='form-control wg-text-field'
                    showTimeSelect showTimeSelectOnly timeIntervals={1} dateFormat="LT" timeCaption="Time" onBlur={this.handleBlurDateTime}/>
                </div>
              </div>
              <p className={'field-error ' + (error.errorTiers[sequence - 1].startError === '' ? '' : 'field-error-show')}>{error.errorTiers[sequence - 1].startError}</p>
              <p className='wg-description'>Date and time when the tier starts. Can't be in the past from the current moment.</p>
            </div>
            <div>
              <label className='wg-label'>End Time</label>
              <div className='d-flex dt-picker-time'>
                <DatePicker
                  selected={endDate} onChange={this.handleChangeEndDate}
                  className='form-control wg-text-field'
                  todayButton='Today' dateFormat='YYYY/MM/DD' onBlur={this.handleBlurDateTime}/>
                <div className='time-input'>
                  <DatePicker
                    selected={endTime} onChange={this.handleChangeEndTime}
                    className='form-control wg-text-field'
                    showTimeSelect showTimeSelectOnly timeIntervals={15} dateFormat="LT" timeCaption="Time" onBlur={this.handleBlurDateTime}/>
                </div>
              </div>
              <p className={'field-error ' + (error.errorTiers[sequence - 1].endError === '' ? '' : 'field-error-show')}>{error.errorTiers[sequence - 1].endError}</p>
              <p className='wg-description'>Date and time when the tier ends. Can be only in the future.</p>
            </div>
            <div>
              <div className='d-flex'>
                <div className='dt-picker-time'>
                  <label className='wg-label'>Lock Date</label>
                  <DatePicker
                    selected={lockDate} onChange={this.handleChangeLockDate}
                    className='form-control wg-text-field' dateFormat='YYYY/MM/DD' onBlur={this.handleBlurDateTime}/>
                </div>
                <div className='time-input'>
                  <label className='wg-label'>Unlock Date</label>
                  <DatePicker
                    selected={unlockDate} onChange={this.handleChangeUnlockDate}
                    className='form-control wg-text-field' dateFormat='YYYY/MM/DD' onBlur={this.handleBlurDateTime}/>
                </div>
              </div>
              <p className={'field-error ' + (error.errorTiers[sequence - 1].errorLock === '' ? '' : 'field-error-show')}>{error.errorTiers[sequence - 1].errorLock}</p>
              <p className='wg-description'>Date from when and until when tokens of this tier will be locked. Tokens of this tier can not be traded during locked period. Unlock
                date must be later than last tier's end datetime.</p>
            </div>
            <InputField id='rate' nameLabel='Rate' type='number' onChange={this.handleChange} value={rate}
                        description="Exchange rate Ethereum to Tokens. If it's 100, then for 1 Ether you can buy 100 tokens"
                        onBlur={this.handleBlurRate} hasError={error.errorTiers[sequence - 1].errorRate}
            />
            <InputField id='supply' nameLabel='Supply' type='number' onChange={this.handleChange} value={supply}
                        description="How many tokens will be sold on this tier. Cap of crowdsale equals to sum of supply of all tiers"
                        onBlur={this.handleBlurSupply} hasError={error.errorTiers[sequence - 1].errorSupply}
            />
            {
              step3.enableWhitelisting === 'yes' &&
              <WhiteList id={sequence}/>
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    step3: state.rootReducer.step3,
    error: state.rootReducer.error,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setError: bindActionCreators(setError, dispatch)
  }
}

TierSetup.propTypes = {
  index: PropTypes.number.isRequired,
  tierData: PropTypes.shape({
    sequence: PropTypes.number,
    allowModifying: PropTypes.boolean,
    tierName: PropTypes.string,
    startDate: PropTypes.date,
    startTime: PropTypes.date,
    endDate: PropTypes.date,
    endTime: PropTypes.date,
    lockDate: PropTypes.date,
    unlockDate: PropTypes.date,
    rate: PropTypes.number,
    supply: PropTypes.number,
  }).isRequired,

  onChange: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TierSetup);