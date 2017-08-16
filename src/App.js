import React, { Component } from 'react';
import logo from './cbt.bmp';
import './App.css';
import Part from './Part.js';


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} alt="logo" />
          <h2>Welcome to CBT Part Data Viewer</h2>
        </div>
        <p className="App-intro">
          Enter the serial/part you need to review 
        </p>
        <Part />        
      </div>
    );
  }
}

export default App;
