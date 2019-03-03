import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Header from './layouts/header';
import Footer from './layouts/footer';
import Landing from './landing';
import TokenVesting from './tokenvesting';

class Index extends Component {

  render() {
    return (
      <Router>
        <div className="page">
          <Header/>
          <Switch>
            <Route path="/" exact component={Landing}/>
            <Route path='/tokenvesting' exact component={TokenVesting}/>
          </Switch>
          <Footer/>
        </div>
      </Router>
    );
  }
}

export default Index;
