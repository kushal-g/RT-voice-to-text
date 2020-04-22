require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');

let app = express();

const io = require('socket.io')(process.env.SOCKET_PORT);

app.use(bodyParser.urlencoded({extended:true}));


//Client server connection
io.on('connection',(socket)=>{
    console.log(chalk.yellow('Client connected to server'));

    //socket emit/on
    socket.on('startRecording',data=>{
        console.log(chalk.magenta('Getting recording...'));
        console.log(data);
    })

})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running at port ${process.env.PORT}`)
})