import React, {Component} from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import { Button, Alert, Spinner, Row, Col, DemoBox, Card, Form, FormInput, FormField, Checkbox} from 'elemental' 
import '../styles.min.css';
import './main.css';
import * as firebase from 'firebase';
var Halogen = require('halogen');

var validate = require("validate.js");


var constraints = {
    email: {
        email: true,
        presence: true
    },
    password: {
        presence: true,
        length: {
            minimum: 6
        }
    },
};


class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            errorMSG: '',
            errorOpacity: 0,
            spinnerSize: '0px'
        };


    }


    componentWillMount() {


        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                if (user.emailVerified) {
                    browserHistory.push('/dashboard')
                    
                } else {
                    
                    browserHistory.push('/verify')
                    
                }

            } else {
                // No user is signed in.
            }
        });


    }

    onemailkeydown(evt){
        if(evt.keyCode === 13){
            this.submit()
        }
    }

    onpasskeydown(evt){
        if(evt.keyCode === 13){
            this.submit()
        }
    }

    onchangeemail(evt) {
        this.setState({
            email: evt.target.value
        })
    }

    onchangepass(evt) {
        this.setState({
            password: evt.target.value
        })
    }

    loginwithfb() {
        let th = this;

        this.setState({spinnerSize:'30px', errorOpacity: 0, errorMSG:''})

        var provider = new firebase.auth.FacebookAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // var token = result.credential.accessToken;
            // The signed-in user info.
            // var user = result.user;


        }).catch(function(error) {
            // Handle Errors here.
            var errorMessage = error.message;
            
            th.setState({
                spinnerSize:'0px',
                errorMSG: errorMessage,
                errorOpacity: 1
            })

        });

    }

    handleValidationSuccss() {

        let th = this;
        this.setState({spinnerSize:'30px', errorOpacity: 0, errorMSG:''})


        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(() => {

        firebase.auth().currentUser.sendEmailVerification().then(function() {

        }, function(error) {
          
        });


        }).catch(function(error) {
            var errorMessage = error.message;
            var errorCode = error.code;

            if (errorCode === "auth/email-already-in-use") {
                firebase.auth().signInWithEmailAndPassword(th.state.email, th.state.password).catch(function(error) {
                    // Handle Errors here.
                    var errorMessage = error.message;

                th.setState({
                    spinnerSize:'0px',
                    errorMSG: errorMessage,
                    errorOpacity: 1
                })



                });
            } else {


                th.setState({
                    spinnerSize:'0px',
                    errorMSG: errorMessage,
                    errorOpacity: 1
                })


            }


        });

    }

    handleValidationError(errors) {


        if (errors instanceof Error) {
            // This means an exception was thrown from a validator
            console.err("An error ocurred", errors);
        } else {
            console.log(errors);
            this.setState({spinnerSize:'30px', errorOpacity: 0, errorMSG:''})
            setTimeout(()=>{
                this.setState({
                    spinnerSize:'0px',
                    errorMSG: (errors.email === undefined ? '' : errors.email[0]) + (Object.keys(errors).length > 1 ? ' | ' : '') + (errors.password === undefined? '' : errors.password[0]),
                    errorOpacity: 1
                })
            }, '1000')

        }


    }




    submit() {
        
        validate.async({ email: this.state.email, password: this.state.password }, constraints).then(this.handleValidationSuccss.bind(this), this.handleValidationError.bind(this));

    }

  render(){
    return (
        <div className="wrapper">
            <div className="navbar-container">
              <div className="logo">
                urlsh!
              </div>              
            </div>


            <div className="login-container">
              
              <Form>
                <FormField label="Email address" htmlFor="basic-form-input-email">
                  <FormInput autoFocus onKeyDown={this.onemailkeydown.bind(this)} placeholder="email" type="input" value={this.state.email} onChange={this.onchangeemail.bind(this)} name="basic-form-input-email" />
                </FormField>
                <FormField label="Password" htmlFor="basic-form-input-password">
                  <FormInput onKeyDown={this.onpasskeydown.bind(this)} type="password" placeholder="password" onChange={this.onchangepass.bind(this)} value={this.state.password} name="basic-form-input-password" />
                </FormField>
                <Button onClick={this.submit.bind(this)}>Create Account or Login</Button>
              </Form>

            </div>

        </div>
      )
  }
}


export default Login;
