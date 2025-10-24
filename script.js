const equipos = {
  "CARRO PORTA BOBINA": [
    "Revisión estructural",
    "Reapriete de pernos",
    "Revisión de motor",
    "Revisión de piñón y cadena",
    "Revisión de cilindro hidráulico",
    "Revisión de flexibles",
    "Rev. Rótulas y conectores",
    "Rev. De ruedas y riel",
    "Lubricación de partes móviles"
  ],
  "DESENROLLADOR DE BOBINA": [
    "Rev. Estructural",
    "Rev. Motoreductor",
    "Rev. Piñón motriz y conductor",
    "Rev. Cadena doble transmisión",
    "Rev. Cilindros hidráulicos",
    "Rev. de Flexibles Hidráulicos",
    "Rev. De F.L.R.",
    "Rev. Sistema de freno",
    "Reapriete de pernos",
    "Rev. Gabinete eléctrico",
    "Rev. De sensores y actuadores",
    "Rev. Central hidráulica",
    "Lubricación de partes móviles"
  ]
  // Agrega más equipos aquí si lo necesitas
};

const checklistWrapper = document.getElementById("checklistWrapper");

const table = document.createElement("table");
table.className = "checklist-table";

const thead = document.createElement("thead");
thead.innerHTML = `
  <tr>
    <th rowspan="2">Equipo</th>
    <th rowspan="2">Ítem</th>
    <th colspan="2">Operativo</th>
    <th colspan="3">Detenido por</th>
    <th rowspan="2">Observaciones</th>
  </tr>
  <tr>
    <th>SI</th><th>NO</th>
    <th>Oper</th><th>Mtto</th><th>Fall</th>
  </tr>
`;
table.appendChild(thead);

const tbody = document.createElement("tbody");

let rowIndex = 0;
for (const equipo in equipos) {
  const items = equipos[equipo];

  items.forEach((item, i) => {
    const tr = document.createElement("tr");

    if (i === 0) {
      const tdEquipo = document.createElement("td");
      tdEquipo.rowSpan = items.length;
      tdEquipo.textContent = equipo;
      tr.appendChild(tdEquipo);
    }

    const tdItem = document.createElement("td");
    tdItem.textContent = item;
    tr.appendChild(tdItem);

    const name = `item_${rowIndex}`;
    ["SI", "NO", "Oper", "Mtto", "Fall"].forEach(value => {
      const td = document.createElement("td");
      td.innerHTML = `<input type="radio" name="${name}" value="${value}" required>`;
      tr.appendChild(td);
    });

    const obsTd = document.createElement("td");
    obsTd.innerHTML = `<input type="text" name="obs_${name}" placeholder="Observaciones...">`;
    tr.appendChild(obsTd);

    tbody.appendChild(tr);
    rowIndex++;
  });
}

table.appendChild(tbody);
checklistWrapper.appendChild(table);

document.getElementById("checklistForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);

  const fecha = data.get("fecha");
  const maquina = data.get("maquina");

  let checklist = "";
  let i = 0;
  for (const equipo in equipos) {
    const items = equipos[equipo];
    items.forEach(item => {
      const estado = data.get(`item_${i}`) || "Sin marcar";
      const obs = data.get(`obs_item_${i}`) || "Sin observaciones";
      checklist += `${equipo} - ${item}:\nEstado: ${estado}\nObservaciones: ${obs}\n\n`;
      i++;
    });
  }

  const templateParams = {
    fecha,
    maquina,
    checklist
  };

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
    .then(() => {
      alert("✅ Enviado correctamente");
      form.reset();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Error al enviar");
    });
});
