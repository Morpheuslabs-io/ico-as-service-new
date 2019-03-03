import React, {Component} from 'react';
import IconButton from '@material-ui/core/IconButton';

import telegramAsset from '../../assets/img/telegram.svg';
import mailAsset from '../../assets/img/mail.svg';
import facebookAsset from '../../assets/img/facebook.svg';
import githubAsset from '../../assets/img/github.svg';
import twitterAsset from '../../assets/img/twitter.svg';
import linkedinAsset from '../../assets/img/linkedin.svg';

class FollowUs extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={'follow-us ' + (this.props.className || '')}>
        <div className='label'>
          Follow Us
        </div>
        <IconButton component='a' href='http://t.me/morpheuslabs' target='_blank'>
          <img src={telegramAsset}/>
        </IconButton>
        <IconButton component='a' href='mailto:info@morpheuslabs.io'>
          <img src={mailAsset}/>
        </IconButton>
        <IconButton component='a' href='https://www.facebook.com/morpheuslabs.io' target='_blank'>
          <img src={facebookAsset}/>
        </IconButton>
        <IconButton component='a' href='https://github.com/morpheuslabs-io' target='_blank'>
          <img src={githubAsset}/>
        </IconButton>
        <IconButton component='a' href='https://twitter.com/morpheuslabs_io' target='_blank'>
          <img src={twitterAsset}/>
        </IconButton>
        <IconButton component='a' href='https://www.linkedin.com/company/morpheuslabs-io' target='_blank'>
          <img src={linkedinAsset}/>
        </IconButton>
      </div>
    );
  }
}

export default FollowUs;