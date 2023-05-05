const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { stringify } = require('querystring');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URI,

    methods: ['GET', 'POST'],
  },
});

const options = {
  useUnifiedTopology: true,
};

mongoose
  .connect(process.env.DATABASE_URI, options)
  .then(() => console.log('Connected to Database'))
  .catch((err) => console.error('Error connecting to database: ', err));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const ROOMS = [
  {
    admin: 'Joe',
    users: [{
      name: 'Doe',
      socketId: '123'
     }, {
      name: 'Doe',
      socketId: '123'
     }],
    usersWhoLeft: ['Donny'],
    /*
    topics: [
      {
        title: 'Skapa frontend',
        score: 5,
      },
      {
        title: 'Skapa backend',
        score: 5,
      },
    ],
    currentTopic: {
        title: topics[currentIndex].title,
        votes: [
          {user: user, score: score},
          {user: user, score: score},
          {user: user, score: score},
          {user: user, score: score}
        ]
    }
  */
  },
]
  ;

const FIBONACCI = [0, 1, 3, 5, 8];
// const ROOMS = [];

app.get('/rooms', (req, res) => {

  res.json(ROOMS)

})




io.on('connection', (socket) => {
  /*
  socket.on('disconnect', () => {
    const roomWithUser = ROOMS.find((room) =>
      room.users.find((user) => user.socketId === socket.id)
    );

    if (!roomWithUser) {
      console.log('User without room left');
      return;
    }

    const user = roomWithUser.find((user) => user.socketId == socket.id);
    const indexOfUser = roomWithUser.users.indexOf(user);

    roomWithUser.splice(indexOfUser, 1);

    roomWithUser.usersWhoLeft.push(user);

    roomWithUser.users.forEach((user) =>
      io.to(user.id).emit('userDisconnect', roomWithUser)
    );
  });
  */
  socket.on('monitorRooms', () => {
    io.emit('monitorRooms', ROOMS);
  });

  socket.on('joinRoom', (userAndRoomIndex) => {
    // userAndRoomIndex = {
    //   user: {id: uuidId, name: "Random", socketId: socketId},
    //   roomIndex: number
    // }

    const roomIndex = userAndRoomIndex.roomIndex;

    const room = ROOMS[roomIndex];
    let userAlreadyInRoom = false;
    room.users.forEach((user) => {
      if (user.userName === userAndRoomIndex.name) {
        console.log('User that name is already in the room.');
        userAlreadyInRoom = true;
        return;
      }
    });
    if (userAlreadyInRoom) {
        io.to(socket.id).emit('userAlreadyInRoom', room);
      return;
    }
    const user = {
      userName: userAndRoomIndex.name,
      socketId: socket.id
    }
    room.users.push(user);
    console.log(ROOMS[roomIndex])
    room.users.forEach((user) => io.to(user.id).emit('joinRoom', room));
  });

  socket.on('leaveRoom', (userAndRoomIndex) => {
    // userAndRoomIndex = {
    //   user: {id: uuidId, name: "Random", socketId: socketId},
    //   roomIndex: number
    // }

    const room = ROOMS[roomIndex];
    const user = room.users.find(
      (user) => user.socketId == userAndRoomIndex.user.socketId
    );
    const indexOfUser = room.users.indexOf(user);

    room.splice(indexOfUser, 1);

    room.usersWhoLeft.push(user);

    room.users.forEach((user) => io.to(user.id).emit('userLeft', room));
  });

  socket.on('deleteRoom', (roomIndex) => {
    const room = ROOMS[roomIndex];
    const usersInRoom = room.users.map((user) => user);

    ROOMS.splice(roomIndex, 1);

    usersInRoom.forEach((user) => io.to(user.socketId).emit('roomDeleted'));
  });

  socket.on('vote', (roomIndexAndUserWhoVotedAndScore) => {
    const room = ROOMS[roomIndex];
    const usersInRoom = room.users.map((user) => user);

    const userAndScore = {
      user: roomIndexAndUserWhoVotedAndScore.user,
      score: roomIndexAndUserWhoVotedAndScore.score,
    };

    room.currentTopic.votes.push(userAndScore);

    if (room.users.length === room.currentTopic.votes.length) {
      const scoresAdded = room.currentTopic.votes.reduce(
        (sum, vote) => sum + vote.score,
        0
      );
      const averageValue = scoresAdded / room.currentTopic.votes.length;
      const fibonacciValue = roundToNearestFibonacci(averageValue);

      const lastUserScoreAndFibonacci = {
        userScore: userAndScore,
        averageValue: fibonacciValue,
      };

      return usersInRoom.forEach((user) =>
        io.to(user.socketId).emit('allVoted', lastUserScoreAndFibonacci)
      );
    }

    usersInRoom.forEach((user) => io.to(user.socketId).emit('vote', user));
  });

  socket.on('changeTopicOrder', (roomAndTopicAndDirection) => {
    const room = ROOMS[roomAndTopicAndDirection.roomIndex];
    const direction = roomAndTopicAndDirection.direction;

    const indexOfTopic = room.topics.indexOf(roomAndTopicAndDirection.topic);

    if (direction == 'down') {
      // handle swap down
      room.topics[indexOfTopic] = room.topics[indexOfTopic + 1];
      room.topics[indexOfTopic + 1] = roomAndTopicAndDirection.topic;
    } else {
      // handle swap up
      room.topics[indexOfTopic] = room.topics[indexOfTopic - 1];
      room.topics[indexOfTopic - 1] = roomAndTopicAndDirection.topic;
    }
  });
});

function roundToNearestFibonacci(number) {
  let nearestFib = FIBONACCI[0];
  let minDifference = Math.abs(number - nearestFib);

  for (let i = 1; i < FIBONACCI.length; i++) {
    const difference = Math.abs(number - FIBONACCI[i]);
    if (difference < minDifference) {
      minDifference = difference;
      nearestFib = FIBONACCI[i];
    }
  }

  return nearestFib;
}

module.exports = { app: app, server: server };
