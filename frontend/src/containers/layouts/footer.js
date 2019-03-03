import React, {Component} from 'react';
import FollowUs from '../../components/layouts/FollowUs';

class Footer extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='footer'>
        <div className='copyright'>
          2018 MITx Network. All rights reserved.
        </div>
        <FollowUs/>
      </div>
    );
  }
}

export default Footer;