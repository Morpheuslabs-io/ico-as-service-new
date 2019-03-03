import React, {Component} from 'react';
import PropTypes from 'prop-types';

class InputField extends Component {

  constructor(props) {
    super(props);

    this.state = {
      value: '',
    }
  }

  onChange = (evt) => {
    this.props.onChange(this.props.id, evt.target.value);
  };

  render() {
    const {id, type, nameLabel, value, description, isRequired, onBlur, hasError} = this.props;
    return (
      <div>
        <label className='wg-label'>{nameLabel}</label>
        <input type={type} className='form-control wg-text-field' required={isRequired}
               id={id} value={value} onBlur={onBlur} onChange={this.onChange}/>
        <p className={'field-error ' + (hasError === '' ? '' : 'field-error-show')}>{hasError}</p>
        <p className='wg-description'>{description}</p>
      </div>
    );
  }
}

InputField.propTypes = {
  nameLabel: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  hasError: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
};

export default InputField;