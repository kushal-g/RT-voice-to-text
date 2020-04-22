import React from 'react';
import socketIOClient from "socket.io-client";


import './App.css';

class App extends React.Component{
  
  static socket;
  constructor(props){
    super(props)
    this.socket = socketIOClient('http://127.0.0.1:80')
    this.state = {
      notSupported:false
    }    
  }

  startRecording = async () =>{
    
    const mimeType = 'audio/webm';
    let chunks = [];
    try{
      let stream = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
      
      let recorder = new MediaRecorder(stream,{type:mimeType});
      
      recorder.start(1000);
      recorder.addEventListener('dataavailable', event => {
        if (typeof event.data === 'undefined') return;
          if (event.data.size === 0) return;
          console.log(event.data);
          this.socket.emit('recording',event.data);
        } 
      );
      
      document.getElementById('audio').srcObject = stream;
      this.socket.emit('startRecording',stream);
    
    
    }catch(e){
      this.setState({notSupported:true})
    
    }
    
  }
  render(){
    
    return (
      <div className="App">
        <h1>Real Time Text-to-Speech</h1>
        <div>
          <audio id="audio" autoplay controls></audio>
          <a href='#' onClick={()=>{this.startRecording()}}>Record</a>
          {this.state.notSupported && <p>Audio Streaming is not supported</p>}
        </div>
      </div>
    );
  }
}

export default App;
