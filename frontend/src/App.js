import React, { Component } from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';



import ShrtnBar from './Components/ShrtnBar.js';
import Header from './Components/Header.js';
import Share from './Components/Share.js';
import Footer from './Components/Footer.js';
import PopularUri from './Components/PopularUri.js';




class App extends Component {

  constructor(props) {
    super(props);
  
    this.state = {};
  }


  render() {

    return (
      <div>


      <Header>
          <ShrtnBar />
      </Header>

      <PopularUri/>


      <Share/>

      <Footer/>

    </div>


    );
  }
}

export default App;
