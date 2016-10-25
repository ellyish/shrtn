import React, { Component } from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';



import Shorten from './index/Shorten.js';
import Header from './index/Header.js';
import Share from './index/Share.js';
import Footer from './index/Footer.js';
import List from './index/List.js';




class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {};
  }


  render() {

    return (
      <div>


      <Header>
          <Shorten />
      </Header>

      <List/>


      <Share/>

      <Footer/>

    </div>


    );
  }
}

export default App;
