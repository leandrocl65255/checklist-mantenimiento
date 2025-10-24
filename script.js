// Inicializa EmailJS
emailjs.init("60ctqCXVaLkGArlbh"); // <-- Reemplazá por tu Public Key de EmailJS

const equipos = {
  // ... (Tu objeto 'equipos' está intacto aquí, no lo repetimos por espacio)
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

    // Operativo SI
    tr.innerHTML += `
      <td><input type="radio" name="operativo_${name}" value="SI" class="operativo" data-group="${name}" required></td>
      <td><input type="radio" name="operativo_${name}" value="NO" class="operativo" data-group="${name}"></td>
    `;

    // Detenido por
    ["Oper", "Mtto", "Fall"].forEach(value => {
      const td = document.createElement("td");
      td.innerHTML = `
        <input type="radio" name="detenido_${name}" value="${value}" class="detenido" data-group="${name}" disabled>
      `;
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

// Activación de radios de detenido
document.addEventListener("change", function (e) {
  if (e.target.matches("input[type=radio].operativo")) {
    const name = e.target.getAttribute("data-group");
    const isNO = e.target.value === "NO";

    const detenidoRadios = document.querySelectorAll(`input[name="detenido_${name}"]`);
    detenidoRadios.forEach(radio => {
      radio.disabled = !isNO;
      if (!isNO) radio.checked = false;
    });
  }
});

// Envío del formulario con Excel adjunto
document.getElementById("checklistForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const fecha = data.get("fecha");
  const maquina = data.get("maquina");

  // Crear contenido para Excel
  const rows = document.querySelectorAll(".checklist-table tbody tr");
  const excelData = [["Equipo", "Ítem", "Operativo", "Detenido por", "Observaciones"]];

  let currentEquipo = "";
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");

    if (cells[0]?.rowSpan) currentEquipo = cells[0].innerText.trim();
    const item = cells[1]?.innerText.trim();
    const operativo = row.querySelector('input[name^="operativo_"]:checked')?.value || "";
    const detenido = row.querySelector('input[name^="detenido_"]:checked')?.value || "";
    const obs = row.querySelector('input[type="text"]')?.value || "";

    excelData.push([currentEquipo, item, operativo, detenido, obs]);
  });

  // Generar Excel
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Checklist");

  const base64Excel = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

  // EmailJS - Enviar adjunto
  const templateParams = {
    fecha,
    maquina,
    'attachments': [
      {
        name: `Checklist-${maquina}-${fecha}.xlsx`,
        data: base64Excel
      }
    ]
  };

  emailjs.send("service_pdb88ye","template_7tm4f9r");
    .then(() => {
      alert("✅ Enviado con archivo Excel adjunto");
      e.target.reset();
    })
    .catch(err => {
      console.error("❌ Error al enviar:", err);
      alert("❌ Error al enviar el checklist");
    });
});


