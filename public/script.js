const userVideo = document.getElementById('user-video')
const startButton = document.getElementById('start-btn');
const state = { media : null };
const socket = io();


//after clicking start we have to record and convert the media into binary to thorow the data on our node.js server
startButton.addEventListener('click', ()=>{
    const mediaRec = new MediaRecorder(state.media, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        framerate: 25
    });
    //on data available log data
    mediaRec.ondataavailable = ev => {
        console.log("Binary Steam Available", ev.data);
        socket.emit('binSteam', ev.data);
    }
    mediaRec.start(25) 
});
//get the user media and show it on our window
window.addEventListener('load', async e=>{
    const media = await navigator
    .mediaDevices
    .getUserMedia({audio: true, video:true})
    state.media = media
    userVideo.srcObject = media
    
});