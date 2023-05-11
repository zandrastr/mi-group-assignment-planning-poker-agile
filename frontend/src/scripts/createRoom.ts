import { socket } from './main';
import { User, Admin, Topic } from './roomSelection';
import { printAdminView } from './adminView';
import { addAdminSockets } from './sockets';

class Room {
  public admin: Admin;
  public users: User[] = [];
  public usersWhoLeft: User[] = [];
  public upcomingTopics: Topic[] = [
    { title: 'Nummer 1', votes: [] },
    { title: 'Nummer 2', votes: [] },
    { title: 'Nummer 3', votes: [] },
  ];
  public currentTopic: Topic = {};
  public previousTopics: Topic[] = [];

  constructor(admin: string) {
    this.admin = { name: admin, socketId: socket.id };
  }
}

export function createRoom(roomAdmin: string) {
  if (!roomAdmin) {
    return alert('Rummet måste ha en admin');
  }

  addAdminSockets();

  const newRoom = new Room(roomAdmin);

  socket.on('createRoomAdmin', (room) => {
    printAdminView(room);

    console.log(room);
    socket.off('createRoomAdmin');
  });

  socket.emit('createRoom', newRoom);
}

export function createRoomElements() {
  const main = document.querySelector('.main-content');
  const createRoomInput = document.createElement('input');
  createRoomInput.placeholder = 'Namn på rum-admin';
  const createRoomBtn = document.createElement('button');
  createRoomBtn.innerHTML = 'Skapa rum';
  createRoomBtn.addEventListener('click', () => {
    createRoom(createRoomInput.value);
  });

  main?.append(createRoomInput, createRoomBtn);
}
