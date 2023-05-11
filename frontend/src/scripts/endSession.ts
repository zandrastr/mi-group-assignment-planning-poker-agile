import { socket } from './main';
import { Room, getAllRooms } from './roomSelection';

export function endSession() {
  socket.emit('endSession', socket.id);
}

export function renderEndSessionPage(room: Room) {
  if (localStorage.getItem('user')) {
    localStorage.removeItem('user');
  }

  const main = document.querySelector<HTMLDivElement>('.main-content');
  main!.innerHTML = '';

  const heading = document.createElement('h1');
  heading.innerHTML = 'Planning Poker rundan är avslutad.';

  const backBtn = document.createElement('button');
  backBtn.innerHTML = 'Tillbaka till rum-val';
  backBtn.addEventListener('click', getAllRooms);

  const topicsTable = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableHeadRow = document.createElement('tr');
  const tableHeadTopic = document.createElement('th');
  tableHeadTopic.innerHTML = 'Titel';
  const tableHeadScore = document.createElement('th');
  tableHeadScore.innerHTML = 'Poäng';

  tableHeadRow.append(tableHeadTopic, tableHeadScore);
  tableHead.appendChild(tableHeadRow);

  const tableBody = document.createElement('tbody');

  room.previousTopics.map((topic) => {
    const tableBodyRow = document.createElement('tr');
    const topicTitle = document.createElement('td');
    topicTitle.innerHTML = topic.title || '';
    const topicScore = document.createElement('td');
    topic.score
      ? (topicScore.innerHTML = topic.score.toString())
      : (topicScore.innerHTML = 'Ofullständig röstning');

    tableBodyRow.append(topicTitle, topicScore);
    tableBody.appendChild(tableBodyRow);
  });

  topicsTable.append(tableHead, tableBody);
  main?.append(heading, topicsTable, backBtn);
}
