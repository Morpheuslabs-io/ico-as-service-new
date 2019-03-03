import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

class BottomButtons extends React.Component {
  render() {
    const step = this.props.step;
    return (
      <div className='bottom-buttons'>
        <Button onClick={step === 4 ? this.props.onInvest : this.props.onContinue} variant='contained' size='large' color="primary"
                className='btn-continue'>{step === 5 ? 'Done' : (step === 3 ? 'Publish' : 'Continue')}</Button>
      </div>
    );
  }
}

BottomButtons.propTypes = {
  step: PropTypes.number.isRequired,
  onContinue: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onInvest: PropTypes.func.isRequired,
};

export default BottomButtons;