import '../style.css';
import { io } from 'socket.io-client';
import { getAllRooms } from './roomSelection';
import { superadminLogin } from './superadminLogin';
import { renderUserView } from './userView';
import { Room } from './roomSelection';
import { printAdminView } from './adminView';

const app = document.querySelector('#app');

app!.innerHTML = `
  <div class="grid-container">
    <header class="header"><h1>Header<h1></header>
    <aside class="upcoming-topics"><h2>Upcoming topics<h2></aside>
    <main class="main-content"><h2>Öppna Rum<h2></main>
    <section class="previous-topics"><h2>Previous topics<h2></section>
    <footer class="footer"></footer>
  </div>`;


export const socket = io('http://localhost:3000');

function init(): void {
  addSockets();
  getAllRooms();
  superadminLogin();
}

function addSockets() {
  socket.on('userAlreadyInRoom', (data) => {
    console.log(data);
    const error = document.createElement('p');
    error.innerText = 'Namnet är upptaget, välj ett annat';
    app!.append(error);
  });

  socket.on('joinRoom', (room: Room) => {
    console.log(room);
    renderUserView(room);
  });

  socket.on('monitorRooms', () => {
    getAllRooms();
  });

  socket.on('startGame', (room) => {
    // lägg till rendera nästa fråga funktion här (user-vy)
    console.log(room);
  });

  socket.on('startGameAdmin', (room) => {
    // lägg till rendera nästa fråga funktion här (admin-vy)
    console.log(room);
  });

  socket.on('noTopics', () => {
    console.log('You need to add atleast 1 topic to start the game.');
  });

  socket.on('missingVotes', () => {
    console.log("Everyone hasn't finished voting yet.");
  });
}

init();
