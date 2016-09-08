import React, {Component} from 'react';
import './signup.css';
class Signup extends Component {

  render(){
    return (

        <div className="cs-signup">
          
          <input placeholder="investors need emails to invest, sorry :( " className="cs-signup-input" type="text">
          
          </input>
          <button className="cs-signup-btn">SUMBIT EMAIL</button>
        </div>



      )
  }

}


export default Signup;


