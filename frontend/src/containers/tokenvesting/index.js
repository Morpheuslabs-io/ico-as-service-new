import React, {Component} from 'react';
import {connect} from 'react-redux';
import Vesting from '../../components/wizard/Vesting';

class TokenVesting extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div className='page-content wizard'>
        <div className='page-wrapper d-flex flex-column'>
          <div className='step-content'>
            <div className='container step-widget pt-0'>
              <Vesting
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

export default connect(mapStateToProps)(TokenVesting);