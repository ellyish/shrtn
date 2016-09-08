import React, {Component} from 'react';
import firebase from 'firebase';

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyD4R-vGHJfz6SFpX_OXz7YG-DsuOzRnCac",
    authDomain: "shrtn-7a4f0.firebaseapp.com",
    databaseURL: "https://shrtn-7a4f0.firebaseio.com",
    storageBucket: "shrtn-7a4f0.appspot.com",
  };
  firebase.initializeApp(config);

class PopularUri extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      urls: []
    };
  }





  componentWillMount(){

      let urls =  firebase.database().ref('urls');

      urls.orderByChild('views').limitToLast(10).on('value', (snapshot)=>{
        let tmpArr = [];

        snapshot.forEach((snapshot)=>{
          let tmpObj = snapshot.val()
          tmpObj.id = snapshot.key;
          tmpArr.push(tmpObj)
        })

      tmpArr.reverse()
      this.setState({urls: tmpArr})

      });





  }

  render(){
    return (

        <div id="results" className="cs-results">
          <div className="cs-list-container">
    
            {this.state.urls.map((elm, i)=>{

                return (
                  <div key={elm.id} className="cs-list-item">
                    <div className="cs-count">{i} &nbsp;</div>

                    <div className="cs-list-item-middle">
                    <h2 dangerouslySetInnerHTML={{__html: elm.title}} ></h2>
                    <h4><a target="_blank" href={elm.long_url}>{elm.long_url}</a></h4>
                    <h3><a target="_blank" href={ 'http://' + elm.short_url + '.urlsh.me'}>{elm.short_url}.urlsh.me</a></h3>
                    </div>
                    <div className="cs-views">{elm.views}</div>

                  </div>)


            })}

  
          </div>
        </div>



      )
  }

}


export default PopularUri;
