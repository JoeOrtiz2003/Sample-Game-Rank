const sheetId = '1srwCRcCf_grbInfDSURVzXXRqIqxQ6_IIPG-4_gnSY8';
let sheetName = 'Game 1';
const query = 'SELECT V, Y, Z, AA, X, AH, W WHERE U IS NOT NULL ORDER BY AH DESC LIMIT 19';

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(() => {
  createCustomDropdown();
  createRankingElements(18);
  fetchSheetData();
  setInterval(fetchSheetData, 5000);
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

  const wrapper = document.querySelector('.bracket-wrapper');
  document.getElementById('scrollUpButton').addEventListener('click', () => {
    wrapper?.scrollBy({ top: -550, behavior: 'smooth' });
  });
  document.getElementById('scrollDownButton').addEventListener('click', () => {
    wrapper?.scrollBy({ top: 550, behavior: 'smooth' });
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

      if (!rows || rows.length === 0) return;

      const getCellValue = (row, index) => {
        const cell = row.c[index];
        return cell?.v ?? '';
      };

      // Sorting: total desc -> place desc -> kills desc (your actual rule)
      const sortedRows = [...rows].sort((a, b) => {
        const totalA = a.c[3]?.v || 0;
        const totalB = b.c[3]?.v || 0;
        if (totalB !== totalA) return totalB - totalA;

        const placeA = a.c[1]?.v ?? 0;  
        const placeB = b.c[1]?.v ?? 0;
        if (placeA !== placeB) return placeB - placeA;  // higher place is better

        const killsA = a.c[2]?.v || 0;
        const killsB = b.c[2]?.v || 0;
        return killsB - killsA;
      });

      // Display Top 1 (winner box)
      const winner = sortedRows[0].c;
      document.getElementById('team_tag').textContent = winner[6]?.v ?? '';
      document.getElementById('elims').textContent = winner[2]?.v ?? '';
      document.getElementById('rank_pts').textContent = winner[1]?.v ?? '';
      document.getElementById('points_total').textContent = winner[3]?.v ?? '';
      document.getElementById('team_logo').src = winner[4]?.v || 'placeholder.png';
      document.getElementById('team_logo').alt = winner[6]?.v ?? 'Team Logo';
      if (winner[5]?.v) {
        document.querySelector('.image-frame').style.backgroundImage = `url('${winner[5].v}')`;
      }

      // Display rest of teams
      const wrapper = document.querySelector('.bracket-wrapper');
      wrapper.innerHTML = '';

      sortedRows.slice(1, 18).forEach((row, index) => {
        const teamName = getCellValue(row, 0);
        const place = getCellValue(row, 1);
        const kills = getCellValue(row, 2);
        const total = getCellValue(row, 3);
        const logoURL = getCellValue(row, 4);

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
    })
    .catch(err => {
      console.error('Sheet fetch error:', err.message);
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
