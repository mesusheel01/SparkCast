import http from 'http'
import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { Server as SocketIO } from 'socket.io'

const app = express();
const port = 4000;

const server = http.createServer(app);
const io  = new SocketIO(server);
const liveKey = "";

app.post('/submit', (req, res) => {
  const userInput = req.body.userInput;
  // Process the user input here (store it, analyze it, etc.)
  liveKey = userInput
  console.log("Received prompt:", liveKey);
  res.send("Prompt received successfully!");
});



//use these options to throw the video coming on rtmp for live streaming
const options = [
    '-i',
    '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', `${25}`,
    '-g', `${25 * 2}`,
    '-keyint_min', 25,
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', 128000 / 4,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${liveKey}`,
];
const ffmpegProcess = spawn('ffmpeg', options);

ffmpegProcess.stdout.on('data', (data)=>{
    console.log(`ffmpeg stdout: ${data}`);
})
ffmpegProcess.stderr.on('data', (data)=>{
    console.error(`ffmpeg stderr: ${data}`);
})

app.use(express.static(path.resolve('./public')));

io.on('connection', socket =>{
    console.log('Socket Connected', socket.id);
    socket.on('binStream', stream =>{
        console.log("binary stream incoming....")
        ffmpegProcess.stdin.write(stream, (err)=>{
            console.log('error: ', err)
        })
    })
});



server.listen(port, ()=>{
    console.log(`HTTP server is running on http://localhost:${port}`);
});