require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');
const {Storage} = require('@google-cloud/storage');
const stream = require('stream');

const chalk = require('chalk');

const app = express();
const storage = new Storage();

// Creates a client
const client = new speech.SpeechClient();

const io = require('socket.io')(process.env.SOCKET_PORT);

app.use(bodyParser.urlencoded({extended:true}));


//Client server connection
io.on('connection',(socket)=>{
    console.log(chalk.yellow('Client connected to server'));

    //socket emit/on
    socket.on('recording',async(data,fn)=>{
        console.log(chalk.magenta('Getting recording...'));
        const audioString = data.toString('base64');
       
        console.log(data);

        try{
          const gcsUri = await uploadRecordingToBucket(data);
          
          const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            audioChannelCount:2
          };
          
          const audio = {
            uri: gcsUri,
          };
          
          const request = {
            config: config,
            audio: audio,
          };
          
          console.log(request);
          const [operation] = await client.longRunningRecognize(request);
          // Get a Promise representation of the final result of the job
          const [response] = await operation.promise();
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          console.log(`Transcription: ${transcription}`);
          fn(transcription)
          socket.disconnect()
          console.log(chalk.gray('Socket is disconnected'))

        }catch(e){
          console.log(chalk.red(e.message))
          fn(e.message);
        }
        
    })

})

async function uploadRecordingToBucket(recordingBuffer,fileName){
  
  return new Promise((resolve,reject)=>{
    const myBucket = storage.bucket('acciobis-audio-file-storage');
    const fileName = `recording-${new Date().getTime()}.wav`;
    const file = myBucket.file(fileName);
    const options = {
      resumable:false,
      gzip:false,
      public:true
    }
    var bufferStream = new stream.PassThrough();
    bufferStream.end(recordingBuffer);
    file.save(recordingBuffer,options,err=>{

      if(err){
        reject(err);
      }
      resolve(`gs://acciobis-audio-file-storage/${fileName}`)
    })
    
  });
  
}

app.listen(process.env.PORT,()=>{
    console.log(`Server is running at port ${process.env.PORT}`)
})