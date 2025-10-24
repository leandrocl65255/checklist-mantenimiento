const equipos = {
  "CARRO PORTA BOBINA": [
    "Revisión estructural",
    "Reapriete de pernos",
    "Revisión de motor",
    "Revisión de piñón y cadena",
    "Revisión de cilindro hidráulico",
    "Revisión de flexibles",
    "Revisión de rótulas y conectores",
    "Revisión de ruedas y riel",
    "Lubricación de partes móviles"
  ],
  "DESENROLLADOR DE BOBINA": [
    "Revisión estructural",
    "Revisión motoreductor",
    "Revisión piñón motriz y piñón conductor",
    "Revisión cadena doble transmisión",
    "Revisión cilindros hidráulicos",
    "Revisión de flexibles hidráulicos",
    "Revisión F.L.R.",
    "Revisión sistema de freno",
    "Reapriete de pernos",
    "Revisión gabinete eléctrico",
    "Revisión sensores y actuadores",
    "Revisión central hidráulica",
    "Lubricación de partes móviles"
  ],
  "MEZA CONFORMADORA": [
    "Revisión estructura de motor y parámetros",
    "Revisión piñón motriz y conducido",
    "Revisión cajas de transmisión",
    "Revisión machones de acoplamiento",
    "Revisión central de lubricación",
    "Revisión de flexibles hidráulicos",
    "Revisión rodillos conformadores",
    "Sistema ajuste altura de rodillos",
    "Revisión rodillos conformadores",
    "Lubricación de partes móviles",
    "Reapriete de pernos"
  ],
  "GUILLOTINA": [
    "Revisión de cuchillos",
    "Revisión prensa chapa",
    "Revisión motoreductor superior",
    "Revisión servomotor",
    "Revisión de carros lineales",
    "Revisión sin fin",
    "Revisión sensores fines de carrera",
    "Revisión sistema soporte cilindro",
    "Reapriete de pernos",
    "Lubricación de partes móviles"
  ],
  "CINTA TRANSPORTADORA": [
    "Revisión estado general de cinta",
    "Revisión de tensores",
    "Revisión de rodillos",
    "Revisión de motor",
    "Revisión piñón motriz y conductor",
    "Revisión cadenas de transmisión",
    "Reapriete de pernos"
  ],
  "STAKER": [
    "Revisión de fugas de aire",
    "Revisión de sensores y actuador",
    "Revisión de cadenas",
    "Revisión de motoreductor",
    "Revisión de piñón motriz y conducido",
    "Revisión de rodamientos",
    "Reapriete de pernos",
    "Lubricación de partes móviles"
  ]
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
    const tdSI = document.createElement("td");
    tdSI.innerHTML = `
      <input type="radio" 
             name="operativo_${name}" 
             value="SI" 
             class="operativo" 
             data-group="${name}" 
             required>
    `;
    tr.appendChild(tdSI);

    // Operativo NO
    const tdNO = document.createElement("td");
    tdNO.innerHTML = `
      <input type="radio" 
             name="operativo_${name}" 
             value="NO" 
             class="operativo" 
             data-group="${name}">
    `;
    tr.appendChild(tdNO);

    // Detenido por: Oper, Mtto, Fall
    ["Oper", "Mtto", "Fall"].forEach(value => {
      const td = document.createElement("td");
      td.innerHTML = `
        <input type="radio" 
               name="detenido_${name}" 
               value="${value}" 
               class="detenido" 
               data-group="${name}" 
               disabled>
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

// Activar o desactivar radios "detenido"
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

// Envío por EmailJS
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
      const op = data.get(`operativo_item_${i}`) || "Sin seleccionar";
      const det = data.get(`detenido_item_${i}`) || "—";
      const obs = data.get(`obs_item_${i}`) || "Sin observaciones";

      checklist += `🔹 ${equipo} - ${item}\n  Estado: ${op}${op === "NO" ? ` (${det})` : ""}\n  Observaciones: ${obs}\n\n`;
      i++;
    });
  }

  const templateParams = {
    fecha,
    maquina,
    checklist
  };

  emailjs.send("service_8xl44v9", "template_7tm4f9r", templateParams)
    .then(() => {
      alert("✅ Checklist enviado correctamente");
      form.reset();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Error al enviar el checklist");
    });
});

