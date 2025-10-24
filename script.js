// Asumiendo que ya tienes equipos + tabla generada + formulario capturado

document.getElementById("checklistForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);
  const fecha = data.get("fecha");
  const maquina = data.get("maquina");

  // Generar los datos para Excel
  const rows = document.querySelectorAll(".checklist-table tbody tr");
  const excelData = [["Equipo", "Ítem", "Operativo", "Detenido por", "Observaciones"]];

  let currentEquipo = "";
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells[0] && cells[0].rowSpan) {
      currentEquipo = cells[0].innerText.trim();
    }
    const item = cells[1] ? cells[1].innerText.trim() : "";
    const operativoInput = row.querySelector(`input[name^="operativo_"]:checked`);
    const detenidoInput = row.querySelector(`input[name^="detenido_"]:checked`);
    const obs = row.querySelector("input[type=text]") ? row.querySelector("input[type=text]").value.trim() : "";
    const operativo = operativoInput ? operativoInput.value : "";
    const detenido = detenidoInput ? detenidoInput.value : "";

    excelData.push([ currentEquipo, item, operativo, detenido, obs ]);
  });

  // Usando SheetJS para crear el archivo
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Checklist");

  const base64Excel = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });

  // Parámetros para EmailJS
  const templateParams = {
    fecha,
    maquina,
    attachments: [
      {
        name: `Checklist-${maquina}-${fecha}.xlsx`,
        data: base64Excel
      }
    ]
  };

  emailjs.send("service_pdb88ye", "template_7tm4f9r", templateParams)
    .then(() => {
      alert("✅ Enviado con archivo Excel adjunto");
      form.reset();
    })
    .catch(err => {
      console.error("❌ Error al enviar:", err);
      alert("Error al enviar el checklist con adjunto");
    });
});
