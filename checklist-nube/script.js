const checklist = {
  "CARRO PORTA BOBINA": [
    "Revision estructural",
    "Reapriete de pernos",
    "Revision de motor",
    "Revision de piñon y cadena",
    "Revision de cilindro hidraulico",
    "Revision de flexibles",
    "Rev. Rotulas y conectores",
    "Rev. De ruedas y riel",
    "Lubricacion de partes moviles"
  ],
  "DESENROLLADOR DE BOBINA": [
    "Rev. Estructural",
    "Rev. Motoreductor",
    "Rev. Piñon motriz y piñon conductor",
    "Rev. Cadena doble transmision",
    "Rev. Cilindros hidraulicos",
    "Rev. de Flexibles Hidraulicos",
    "Rev. De F.L.R.",
    "Rev. Sistema de freno",
    "Reapriete de pernos",
    "Rev. Gabinete electrico",
    "Rev. De sensores y actuadores",
    "Rev. Central hidraulica",
    "Lubricacion de partes moviles"
  ]
  // … puedes agregar más equipos y sus items aquí …
};

const container = document.getElementById("checklistContainer");

for (const equipo in checklist) {
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = equipo;
  fieldset.appendChild(legend);

  checklist[equipo].forEach(item => {
    const div = document.createElement("div");
    div.className = "item-check";
    div.innerHTML = `
      <label>${item}</label>
      <select name="${equipo}_${item}">
        <option value="">--</option>
        <option value="SI">SI</option>
        <option value="NO">NO</option>
        <option value="Oper">Oper</option>
        <option value="Mtto">Mtto</option>
        <option value="Fall">Fall</option>
      </select>
    `;
    fieldset.appendChild(div);
  });

  container.appendChild(fieldset);
}

document.getElementById("checklistForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => data[key] = value);

  let checklistText = "";
  Object.keys(data).forEach(key => {
    if (!["fecha", "maquina", "estado", "observaciones"].includes(key)) {
      checklistText += `${key}: ${data[key] || "No respondido"}\n`;
    }
  });

  const templateParams = {
    fecha: data.fecha,
    maquina: data.maquina,
    estado: data.estado,
    observaciones: data.observaciones || "Ninguna",
    checklist: checklistText
  };

  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
    .then(() => {
      alert("✅ Envío exitoso");
      form.reset();
    }, (error) => {
      console.error("Error al enviar:", error);
      alert("❌ Error al enviar. Ver consola para más info.");
    });
});
