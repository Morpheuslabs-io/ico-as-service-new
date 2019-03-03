import React, {Component} from 'react';
import StepCircle from './StepCircle';
import PropTypes from 'prop-types';

class Stepper extends Component {
  render() {
    const titles = [
      'Crowdsale Contract',
      'Token Setup',
      'Crowdsale Setup',
      'Publish',
      'Dashboard Page'
    ];

    const {step} = this.props;

    return (
      <div className='stepper'>
        {titles.map((title, index) => (
          <StepCircle key={index} step={index + 1} currentStep={step} title={title}/>
        ))}
      </div>
    );
  }
}

Stepper.propTypes = {
  step: PropTypes.number.isRequired,
};
export default Stepper;