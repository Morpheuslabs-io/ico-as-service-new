import React, {Component} from 'react';
import PropTypes from 'prop-types';

class StepInfo extends Component {

  render() {
    return (
      <div className='step-info'>
        <div className='step-circle'>
          <img src={this.props.imageUrl} className='step-image'/>
        </div>
        <p className='step-no'>{this.props.no}</p>
        <p className='step-title'>{this.props.title}</p>
        <p className='step-description'>{this.props.description}</p>
      </div>
    );
  }

}

StepInfo.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  no: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default StepInfo;