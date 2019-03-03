import React from 'react';
import ReactDOM from 'react-dom';
import {Route} from 'react-router-dom';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import reduxThunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import {ConnectedRouter, routerReducer, routerMiddleware} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import dotenv from "dotenv";

import rootReducer from './redux/reducers';
import App from './containers';
import registerServiceWorker from './registerServiceWorker';

import './assets/bootstrap/scss/bootstrap.scss';
import './assets/styles/index.scss';
import {setAuthorizationHeader} from "./components/wizard/Utils";
import * as types from "./redux/types";

dotenv.config();

// Create history object, redux store
const history = createHistory();
const middleware = composeWithDevTools(applyMiddleware(reduxThunk, routerMiddleware(history)));
const store = middleware(createStore)(combineReducers({rootReducer, routerReducer}));

// Check if saved jwt token exists
if (localStorage.getItem("token")) {
  setAuthorizationHeader(localStorage.getItem("token"));
  store.dispatch({
    type: types.SET_TOKEN,
    data: {
      token: localStorage.getItem("token"),
    }
  });
}

export default store;

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route component={App}/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
