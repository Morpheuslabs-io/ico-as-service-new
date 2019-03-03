import React, {Component} from 'react';
import PropTypes from 'prop-types';

class StepCircle extends Component {

  render() {
    return (
      <div className='step-unit'>
        <div className='d-flex back-border'>
          <div className={'back-border-left ' + (this.props.step <= this.props.currentStep ? 'passed' : '')}/>
          <div className={'back-border-right ' + (this.props.step < this.props.currentStep ? 'passed' : '')}/>
        </div>
        <div className='unit-circle'>
          <div className={(this.props.currentStep === this.props.step ? ' active-circle ' : '') || (this.props.step < this.props.currentStep ? ' passed-active-circle ' : '')}>
            {this.props.step}
          </div>
        </div>
        <div className={'step-title ' + (this.props.currentStep === this.props.step ? 'active-title' : '')}>
          {this.props.title}
        </div>
      </div>
    );
  }
}

StepCircle.propTypes = {
  step: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default StepCircle;