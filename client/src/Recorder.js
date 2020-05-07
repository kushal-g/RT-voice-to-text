import React from 'react';
import socketIOClient from "socket.io-client";
import Recorder from 'recorder-js';
import './App.css';

class STTRecorder{
  
  static socket;
  static recorder;

  startRecording = async () =>{
    this.socket = socketIOClient('http://127.0.0.1:80')
    const audioContext =  new (window.AudioContext || window.webkitAudioContext)();
    
    const mimeType = 'audio/wav';

    this.recorder = new Recorder(audioContext,{
      'numChannels':2,
      'mimeType':mimeType,
    })
    
    try{
      let stream = await navigator.mediaDevices.getUserMedia({
        audio:{
          sampleRate:48000,
          channelCount:2
        },
        video:false
      });
      
      this.recorder.init(stream)
      await this.recorder.start();   
    }catch(e){
      console.log(e.message)
    }
    
  }

  stopRecording = async () =>{
    const {blob, buffer} = await this.recorder.stop()
    console.log(blob)
    document.getElementById('audio').src = URL.createObjectURL(blob);
    this.socket.emit('recording',blob,transcript=>{
      console.log(transcript);
    });
  }

}

class Test extends React.Component{
  

  constructor(props){
    super(props)
    this.record = new STTRecorder()
    this.state = {
      recording:false
    }
  }


  startRecording = () =>{
    this.setState({recording:true})
    this.record.startRecording()
  }

  stopRecording = () =>{
    this.setState({recording:false})
    this.record.stopRecording()
  }
  
  render(){
    
    return (
      //TODO:Extract recorder as a separate component
      <div className="App">
        <h1>Real Time Speech-To-Text</h1>
        <div>
          <audio id="audio" autoPlay controls></audio>
          <a href='#' onClick={()=>{this.state.recording?this.stopRecording():this.startRecording()}}>
            {this.state.recording?'Stop':'Record'}
          </a>
          {<p>{this.state.transcript}</p>}
          {this.state.notSupported && <p>Audio Streaming is not supported</p>}
        </div>
      </div>
    );
  }

}

export default Test;
