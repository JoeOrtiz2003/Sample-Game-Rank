const sheetId = '1srwCRcCf_grbInfDSURVzXXRqIqxQ6_IIPG-4_gnSY8';
let sheetName = 'Game 1';
const query = 'SELECT V, Y, Z, AA, X, AH, W WHERE U IS NOT NULL ORDER BY AH DESC LIMIT 18';

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
  createCustomDropdown();
  createRankingElements(18); 
  fetchSheetData();
  setInterval(fetchSheetData, 3000);
  // Removed autoScrollBracket and related calls
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
      document.getElementById('slogan').textContent = game.replace("Game", "MATCH");
      dropdownBtn.textContent = game;
      menu.style.display = 'none';
      fetchSheetData();
    });
    menu.appendChild(item);
  }

  // Scroll buttons event listeners
  const wrapper = document.querySelector('.bracket-wrapper');
  document.getElementById('scrollUpButton').addEventListener('click', () => {
    if (!wrapper) return;
    wrapper.scrollBy({ top: -500, behavior: 'smooth' });
  });

  document.getElementById('scrollDownButton').addEventListener('click', () => {
    if (!wrapper) return;
    wrapper.scrollBy({ top: 500, behavior: 'smooth' });
  });
}

function fetchSheetData() {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=${encodedQuery}`;

  fetch(url)
    .then(res => res.text())
    .then(rep => {
      const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
      const rows = jsonData.table.rows;

      const getCellValue = (row, index) => {
        const cell = row.c[index];
        return (cell && cell.v !== null && cell.v !== undefined) ? cell.v : '';
      };

      const wrapper = document.querySelector('.bracket-wrapper');
      wrapper.innerHTML = '';

      // Sort rows except the first/top one by total points descending
      const sortedRows = rows.slice(1).sort((a, b) => {
        const totalA = a.c[3]?.v || 0;
        const totalB = b.c[3]?.v || 0;
        return totalB - totalA;
      });

      // Render sorted rows
      sortedRows.forEach((row, index) => {
        const teamName = getCellValue(row, 0);
        const place = getCellValue(row, 1);
        const kills = getCellValue(row, 2);
        const total = getCellValue(row, 3);
        const logoURL = getCellValue(row, 4);
        const bgImageURL = getCellValue(row, 5);

        const bracket = document.createElement('div');
        bracket.className = 'bracket';
        bracket.innerHTML = `
          <p>${index + 2}</p>
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
        document.getElementById('team_tag').textContent = top[6]?.v ?? '';
        document.getElementById('elims').textContent = top[2]?.v ?? '';
        document.getElementById('rank_pts').textContent = top[1]?.v ?? '';
        document.getElementById('points_total').textContent = top[3]?.v ?? '';
        document.getElementById('team_logo').src = top[4]?.v || 'placeholder.png';
        document.getElementById('team_logo').alt = top[6]?.v ?? 'Team Logo';

        const bgImageURL = top[5]?.v;
        if (bgImageURL) {
          document.querySelector('.image-frame').style.backgroundImage = `url('${bgImageURL}')`;
        }
      }
    })
    .catch(err => {
      console.error('Sheet fetch error:', err.message);
      console.warn('Failed URL:', url);
      createRankingElements(18);
    });
}

function createRankingElements(count = 18) { 
  const wrapper = document.querySelector('.bracket-wrapper');
  wrapper.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const bracket = document.createElement('div');
    bracket.className = 'bracket';
    bracket.innerHTML = `
      <p>${i + 1}</p>
      <div class="bracket-logo"><img src="placeholder.png" alt="Team logo" /></div>
      <p class="team-name">Team Name</p>
      <p>0</p>
      <p>0</p>
      <p>0</p>
    `;
    wrapper.appendChild(bracket);
  }
}
