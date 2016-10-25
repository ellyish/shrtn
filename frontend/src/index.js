import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './login/main'
import Dashboard from './dashboard/main'

import { Router, Route, Link, browserHistory } from 'react-router'







ReactDOM.render(
  
  <Router history={browserHistory}>
    <Route path="/" component={App} />
    <Route path="/login" component={Login} />
    <Route path="/dashboard" component={Dashboard} />

  </Router>



  ,
  document.getElementById('root')
);
