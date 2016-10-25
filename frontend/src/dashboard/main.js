import React, {Component} from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import { Button, Alert, Spinner, Row, Col, DemoBox, Card, Form, FormInput, ButtonGroup, FormField, Checkbox, InputGroup} from 'elemental' 
import '../styles.min.css';
import './main.css';
import * as firebase from 'firebase';
import axios from 'axios';
var _ = require('underscore');
import {Doughnut, Bar} from 'react-chartjs-2';




var alphabet = "1234567890abcdefghijkmnopqrstuvwxyz";
var base = alphabet.length; // base is the length of the alphabet (58 in this case)

function decode(str) {
    var decoded = 0;
    while (str) {
        var index = alphabet.indexOf(str[0]);
        var power = str.length - 1;
        decoded += index * (Math.pow(base, power));
        str = str.substring(1);
    }
    return decoded;
}






class Dashboard extends Component {

  constructor(props) {
      super(props);

      this.state = {
          longUrl: '',
          urls: [],
          currentUrl: '',
          devicType: {
              labels: ['no data yet'],
              datasets: [{
                  data: [1],
                  backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ],
                  hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ]
              }]
          },
          locationData: {
              labels: ['no data yet'],
              datasets: [{
                  data: [1],
                  backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ],
                  hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ]
              }]
          },
          referrerData: {
              labels: ['no data yet'],
              datasets: [{
                  data: [1],
                  backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ],
                  hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ]
              }]
          },
          monthlyClickData: {
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','Septmber','October','November','December'],
              datasets: [{
                  label: 'Monthly Clicks',
                  backgroundColor: 'rgba(255,99,132,0.2)',
                  borderColor: 'rgba(255,99,132,1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                  hoverBorderColor: 'rgba(255,99,132,1)',
                  data: []
              }]
          },
          dailyClickData: {
              labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
              datasets: [{
                  label: 'Daily Clicks',
                  backgroundColor: 'rgba(255,99,132,0.2)',
                  borderColor: 'rgba(255,99,132,1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                  hoverBorderColor: 'rgba(255,99,132,1)',
                  data: []
              }]
          },


      };

  }


  componentWillMount() {

      let ths = this;
      firebase.auth().onAuthStateChanged(function(user) {
          if (user) {

              firebase.database().ref('/urls').orderByChild("owner").equalTo(firebase.auth().currentUser.uid).on('value', function(snapshot) {

                  let tmpArr = [];

                  snapshot.forEach((snapshot) => {
                      let tmpObj = snapshot.val()
                      tmpObj.id = snapshot.key;
                      tmpArr.push(tmpObj)
                  })

                  tmpArr.reverse()
                  ths.setState({ urls: tmpArr })


              })


          } else {
              // No user is signed in.
              browserHistory.push('/login')

          }

      });


  }


  shorten() {

      axios.post('/api/shorten', {
              url: this.state.longUrl,
              owner: firebase.auth().currentUser.uid
          })
          .then(function(response) {

          })
          .catch(function(error) {

          });

  }


  onLongUrlInputChange(evt) {
      this.setState({
          longUrl: evt.target.value
      })
  }

  loadUrlData(id, evt){
    let ths = this;
    // set url analytics data
    firebase.database().ref('/data/' + decode(id)).once('value', function(snapshot) {
      console.log(snapshot.val());

      var groupedData = _.groupBy(snapshot.val(), function(d){return d.devicType});

      let empDeviceLengthArr = [];
      _.each(groupedData, (elm)=>{
        empDeviceLengthArr.push(elm.length);
      })


      console.log(empDeviceLengthArr);


        ths.setState({devicType: {
              labels: Object.keys(groupedData).length > 0 ? Object.keys(groupedData) : ['no data yet']  ,
              datasets: [{
                  data: empDeviceLengthArr.length > 0 ? empDeviceLengthArr : [1],
                  backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ],
                  hoverBackgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56'
                  ]
              }]
        }})




    })

  }


  render(){
    return (
        <div className="wrapper">
            <div className="navbar-container">
              <div className="logo">
                urlsh!
              </div>              
            </div>


          <div className="shorten-container">
            <InputGroup contiguous>
              <InputGroup.Section grow>
                <FormInput onChange={this.onLongUrlInputChange.bind(this)} value={this.state.longUrl} type="text" placeholder="paste your long urls here" />
              </InputGroup.Section>
              <InputGroup.Section>
                <Button onClick={this.shorten.bind(this)}>Shorten</Button>
              </InputGroup.Section>
            </InputGroup>
            </div>


          <div className="tabs-container">

            <ButtonGroup>
              <Button type="default" size="sm">Analytics</Button>
              <Button type="default" size="sm">Campaigns</Button>
              <Button type="default" size="sm">Settings</Button>
            </ButtonGroup>
            </div>


            <div className="dashboard-container">

              <Row>

                  <Col sm="20%">
                  <div className="urls-list">

                    {
                      this.state.urls.map((elm)=>{
                        console.log(elm);
                        return (
                            <div key={elm.id} onClick={this.loadUrlData.bind(this, elm.short_url)} className="list-item">{elm.long_url}</div>

                          )
                      })
                    }
                  </div>
                  </Col>
                  <Col sm="80%">


                    <Row>
                      <Col sm="50%">
                        <h4>Location</h4>
                        <Doughnut data={this.state.locationData} />
                      </Col>
                    
                      <Col sm="50%">
                        <h4>Referrer</h4>
                        <Doughnut data={this.state.referrerData} />
                      </Col>
                      <Col sm="50%">
                        <h4>Device Type</h4>
                        <Doughnut data={this.state.devicType} />
                      </Col>     
                    </Row>
                        <h4>Daily Clicks</h4>
                          <div className="BarCont">
                          <Bar
                            data={this.state.monthlyClickData}
                            width={10}
                            height={10}
                            options={{
                              maintainAspectRatio: false
                            }}
                          />
                          </div>
                          <div className="BarCont">
                          <Bar
                            data={this.state.dailyClickData}
                            width={10}
                            height={10}
                            options={{
                              maintainAspectRatio: false
                            }}
                          />
                          </div>

                    


                  </Col>

              </Row>
                            

            </div>

        </div>
      )
  }
}


export default Dashboard;
