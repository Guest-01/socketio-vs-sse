import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public/index.html'));
});

// ------- SocketIO ---------

app.get('/socketio', (req, res) => {
  res.sendFile(join(__dirname, 'public/socketio.html'));
});

io.of("/socketio/cpumemdisk").on('connection', (socket) => {
  socket.emit('init-msg', 'connection successful');
  const intervalId = setInterval(() => { socket.emit('data', { data: [getRandomInt(50, 100), getRandomInt(1, 50), getRandomInt(50, 100)] }) }, 500);
  
  socket.on('disconnect', (reason, description) => {
    console.log(reason, description);
    clearInterval(intervalId);
  })
})

// ------- SSE ---------

app.get('/sse', (req, res) => {
  res.sendFile(join(__dirname, 'public/sse.html'));
});

app.get('/sse/cpumemdisk', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let intervalId = setInterval(() => {
      res.write(`data: ${JSON.stringify({ data: [getRandomInt(1, 50), getRandomInt(50, 100), getRandomInt(1, 50)] })}\n\n`); // res.write() instead of res.send()
  }, 500);

  res.on('close', () => {
      console.log('client dropped me');
      clearInterval(intervalId);
      res.end();
  });
});

// -----------------------------------

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
