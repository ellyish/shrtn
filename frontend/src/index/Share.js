

import React, {Component} from 'react';
import { FacebookButton, FacebookCount, TwitterButton, TwitterCount } from "react-social";
var FontAwesome = require('react-fontawesome');
import './Share.css';


class Share extends Component {

  render(){
    return (

        <div>
          <div className="decoration4"></div>
          <div className="decoration5"></div>

        <div className="cs-share">
          share every where &nbsp;
          <FacebookButton  className="cs-fb" url={window.location.href} appId="1085874651478508">
          <FontAwesome  className="cs-fb-icon" name='facebook' />
          &nbsp; <FacebookCount url={window.location.href} /> shares
          </FacebookButton>
          &nbsp; and &nbsp;
          <TwitterButton  className="cs-twit" url={window.location.href} appId="496514490542725">
          <FontAwesome className="cs-twit-icon" name='twitter' />
          &nbsp; <TwitterCount  url={window.location.href} /> twitts
          </TwitterButton>
        </div>

        </div>


      )
  }

}


export default Share;


