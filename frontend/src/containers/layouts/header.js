import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Link} from "react-router-dom";
import Button from '@material-ui/core/Button';

import assetLogo from '../../assets/img/logo.svg';
import hamburgerMenu from '../../assets/img/hambeger.svg';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
    };
  }

  onClickHamburger = () => {
    this.setState({
      menuOpen: true,
    })
  };

  render() {
    return (
      <div className='header'>
        <Button className='hamburger-btn' onClick={this.onClickHamburger}>
          <img src={hamburgerMenu} className='hamburger-icon'/>
        </Button>
        <Link to='/'>
          <img src={assetLogo} className='logo'/>
        </Link>
      </div>
    );
  }
}

export default Header;