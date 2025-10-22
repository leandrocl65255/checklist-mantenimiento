const data = [
  {
    equipo: "CARRO PORTA BOBINA",
    revisiones: [
      "Revisión estructural", "Revisión de motor", "Revisión de ruedas"
    ]
  },
  {
    equipo: "DESENROLLADOR",
    revisiones: [
      "Revisión de cadena", "Revisión de sensores", "Revisión de hidráulica"
    ]
  }
];

const tbody = document.getElementById('checklist-body');

data.forEach(({ equipo, revisiones }) => {
  const rowTitle = document.createElement('tr');
  rowTitle.innerHTML = `<td colspan="8" style="background:#eee"><strong>${equipo}</strong></td>`;
  tbody.appendChild(rowTitle);

  revisiones.forEach(rev => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td></td>
      <td>${rev}</td>
      <td><input type="checkbox"></td>
      <td><input type="checkbox"></td>
      <td><input type="checkbox"></td>
      <td><input type="checkbox"></td>
      <td><input type="checkbox"></td>
      <td><textarea></textarea></td>
    `;
    tbody.appendChild(row);
  });
});

document.getElementById('guardarEnviar').addEventListener('click', () => {
  const rows = document.querySelectorAll('#checklist-body tr');
  const output = [];
  let currentEquipo = '';

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 1) {
      currentEquipo = cells[0].innerText.trim();
    } else {
      output.push({
        Equipo: currentEquipo,
        Revisión: cells[1].innerText.trim(),
        SI: cells[2].querySelector('input').checked ? '✔️' : '',
        NO: cells[3].querySelector('input').checked ? '❌' : '',
        Oper: cells[4].querySelector('input').checked ? '✔️' : '',
        MttO: cells[5].querySelector('input').checked ? '✔️' : '',
        Falla: cells[6].querySelector('input').checked ? '✔️' : '',
        Observación: cells[7].querySelector('textarea').value.trim()
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(output);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Checklist");

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });

  const formData = new FormData();
  formData.append("file", blob, "checklist.xlsx");

  fetch("https://TU_BACKEND_RENDER_URL/enviar-excel", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(res => alert("✅ Enviado correctamente"))
  .catch(err => alert("❌ Error al enviar: " + err.message));
});