const sheetId = '1srwCRcCf_grbInfDSURVzXXRqIqxQ6_IIPG-4_gnSY8';
let sheetName = 'Game 1';
// Added Q as index 6 to get team_tag
const query = 'SELECT D, G, H, I, F, P, E WHERE D IS NOT NULL ORDER BY G DESC LIMIT 17';

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
  createCustomDropdown();
  fetchSheetData();
  createRankingElements(17);
  setInterval(fetchSheetData, 3000);
  autoScrollBracket();
});

function createCustomDropdown() {
  const dropdownBtn = document.getElementById('dropdownButton');
  const menu = document.getElementById('dropdownMenu');

  dropdownBtn.addEventListener('click', () => {
    menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
  });

  for (let i = 1; i <= 15; i++) {
    const game = `Game ${i}`;
    const item = document.createElement('button');
    item.textContent = game;
    item.style = "display:block; width:100%; padding:6px; text-align:left; border:none; background:white; cursor:pointer;";
    item.addEventListener('click', () => {
      sheetName = game;
      document.getElementById('slogan').textContent = game.replace("Game", "Match");
      dropdownBtn.textContent = game;
      menu.style.display = 'none';
      fetchSheetData();
    });
    menu.appendChild(item);
  }
}

function fetchSheetData() {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${encodedQuery}`;

  fetch(url)
    .then(res => res.text())
    .then(rep => {
      const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
      const rows = jsonData.table.rows;
      const getCellValue = (row, index) => row.c[index]?.v || '';
      const wrapper = document.querySelector('.bracket-wrapper');
      wrapper.innerHTML = '';

      rows.forEach((row, index) => {
        const teamName = getCellValue(row, 0);
        const place = getCellValue(row, 1);
        const kills = getCellValue(row, 2);
        const total = getCellValue(row, 3);
        const logoURL = getCellValue(row, 4);
        const bgImageURL = getCellValue(row, 5);

        const bracket = document.createElement('div');
        bracket.className = 'bracket';
        bracket.innerHTML = `
          <p>${index + 1}</p>
          <div class="bracket-logo"><img src="${logoURL}" alt="${teamName} logo" /></div>
          <p>${teamName}</p>
          <p>${place}</p>
          <p>${kills}</p>
          <p>${total}</p>
        `;
        wrapper.appendChild(bracket);
      });

      if (rows.length > 0) {
        const top = rows[0].c;
        document.getElementById('team_tag').textContent = top[6]?.v || ''; // team_tag
        document.getElementById('elims').textContent = top[2]?.v || '';
        document.getElementById('rank_pts').textContent = top[1]?.v || '';
        document.getElementById('points_total').textContent = top[3]?.v || '';
        document.getElementById('team_logo').src = top[4]?.v || 'placeholder.png';
        document.getElementById('team_logo').alt = top[6]?.v || 'Team Logo'; // alt = tag

        const bgImageURL = top[5]?.v;
        if (bgImageURL) {
          document.querySelector('.image-frame').style.backgroundImage = `url('${bgImageURL}')`;
        }
      }
    })
    .catch(err => {
      console.error('Sheet fetch error:', err);
      createRankingElements(17);
    });
}

function autoScrollBracket() {
  const wrapper = document.querySelector('.bracket-wrapper');
  let scrollDown = true;

  function scrollAction() {
    if (!wrapper) return;
    const maxScroll = wrapper.scrollHeight - wrapper.clientHeight;

    if (scrollDown) {
      wrapper.scrollTo({ top: maxScroll, behavior: 'smooth' });
      setTimeout(() => {
        scrollDown = false;
        scrollAction();
      }, 5000);
    } else {
      wrapper.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        scrollDown = true;
        scrollAction();
      }, 10000);
    }
  }

  scrollAction();
}

function createRankingElements(count = 17) {
  const wrapper = document.querySelector('.bracket-wrapper');
  wrapper.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const bracket = document.createElement('div');
    bracket.className = 'bracket';
    bracket.innerHTML = `
      <p>${i + 1}</p>
      <div class="bracket-logo"><img src="placeholder.png" alt="Team Logo" /></div>
      <p>Team ${i + 1}</p>
      <p>${Math.floor(Math.random() * 20) + 1}</p>
      <p>${Math.floor(Math.random() * 10)}</p>
      <p>${Math.floor(Math.random() * 100)}</p>
    `;
    wrapper.appendChild(bracket);
  }
}
