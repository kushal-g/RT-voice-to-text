import React from 'react';
import socketIOClient from "socket.io-client";
import Recorder from 'recorder-js';
import './App.css';

class App extends React.Component{
  
  static socket;
  static recorder;
  constructor(props){
    super(props)
    this.socket = socketIOClient('http://127.0.0.1:80')
    this.state = {
      recording:false,
      notSupported:false,
      transcript:''
    }    
  }

  startRecording = async () =>{
    
    const audioContext =  new (window.AudioContext || window.webkitAudioContext)();
    
    const mimeType = 'audio/wav';

    this.recorder = new Recorder(audioContext,{
      'numChannels':1,
      'mimeType':mimeType
    })
    let chunks = [];
    try{
      let stream = await navigator.mediaDevices.getUserMedia({
        audio:{
          channelCount:1
        },
        video:false
      });
      
      
      this.recorder.init(stream)
      
      await this.recorder.start();
      this.setState({recording:true});  
      /* recorder.addEventListener('dataavailable', event => {
        if (typeof event.data === 'undefined') return;
          if (event.data.size === 0) return;
          console.log(event.data);
          this.socket.emit('recording',event.data);
        } 
      ); */
      
    
    
    }catch(e){
      this.setState({notSupported:true})
    
    }
    
  }

  stopRecording = async () =>{
    
    const {blob, buffer} = await this.recorder.stop()
    console.log(blob)
    document.getElementById('audio').src = URL.createObjectURL(blob);
    this.setState({recording:false});
    this.socket.emit('recording',blob,transcript=>{
      this.setState({transcript:transcript})
    });
  }

  render(){
    
    return (
      //TODO: Extract recorder as a separate component
      <div className="App">
        <h1>Real Time Text-to-Speech</h1>
        <div>
          <audio id="audio" autoPlay controls></audio>
          <a href='#' onClick={()=>{this.state.recording?this.stopRecording():this.startRecording()}}>
            {this.state.recording?'Stop':'Record'}
          </a>
          {this.state.transcript.length>0 && <p>{this.state.transcript}</p>}
          {this.state.notSupported && <p>Audio Streaming is not supported</p>}
        </div>
      </div>
    );
  }
}

export default App;
