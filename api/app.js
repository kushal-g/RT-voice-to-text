require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');

const chalk = require('chalk');

const app = express();

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
        const audio = {
          content: audioString,
        };

        const config = {
          encoding: 'LINEAR16',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        };
        const request = {
          audio: audio,
          config:config
        };

        const [response] = await client.recognize(request);
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        console.log(`Transcription: ${transcription}`);
        fn(transcription)

    })

})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running at port ${process.env.PORT}`)
})