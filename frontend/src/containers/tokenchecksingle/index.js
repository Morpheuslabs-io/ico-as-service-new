import React, {Component} from 'react';
import {connect} from 'react-redux';
import CheckSingle from '../../components/wizard/CheckSingle';

class TokenCheckSingle extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div className='page-content wizard'>
        <div className='page-wrapper d-flex flex-column'>
          <div className='step-content'>
            <div className='container step-widget pt-0'>
              <CheckSingle
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(TokenCheckSingle);