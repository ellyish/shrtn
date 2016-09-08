import React, { Component } from 'react'
import './ShrtnBar.css';
import * as PubSub from 'pubsub-js'
import axios from 'axios';
class ShrtnBar extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      inputvalue: ''
    };

  }

  componentWillMount() {
    PubSub.publish('hideResult');     
  }

  onfocus(){

    this.setState({ inputvalue: ''});
    PubSub.publish( 'showCurtain' );
    PubSub.publish('hideResult');
    PubSub.publish('hideError');

    PubSub.publish('showFat');

  }


  onblur(){
    PubSub.publish('hideCurtain' );
    // PubSub.publish('hideResult');
    // PubSub.publish('showFat');
  }

  onchange(evt){
    this.setState({ inputvalue: evt.target.value})
  }


  request(){

        PubSub.publish('hideResult');     
        PubSub.publish('hideError');     

        PubSub.publish('startLoading');

        let cp = this;

        axios.post('/api/shorten', {
            url: this.state.inputvalue,
        })
            .then(function(response) {
                PubSub.publish('showResult');
                PubSub.publish('setResult', {
                    url: response.data
                });
                cp.setState({
                    inputvalue: ''
                });

                PubSub.publish('showThin');
                PubSub.publish('endLoading');


            })
            .catch(function(error) {
                PubSub.publish('triggerError');
                PubSub.publish('endLoading');

            });

  }

  onkeydown(evt){
    if(evt.key === 'Enter'){
      this.request()
    }
  }


  onclick(evt){

      this.request()

  }



  render(){
    return(
      <div  className={"cs-srch-container"}>
      
        <input onKeyDown={this.onkeydown.bind(this)} value={this.state.inputvalue} 
        onChange={this.onchange.bind(this)} onBlur={this.onblur} onFocus={this.onfocus.bind(this)} 
        className="cs-srch-input" type="text" placeholder="https://yourlongurl.domain/extrainfo"></input>
        <button onClick={this.onclick.bind(this)} className="cs-srch-btn">SHRTN!</button>
      </div>


    )
  }
}


export default ShrtnBar;

