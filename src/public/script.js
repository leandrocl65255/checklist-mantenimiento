const data = [
  {
    equipo: "CARRO PORTA BOBINA",
    revisiones: [
      "Revisión estructural",
      "Reparación de pernos",
      "Revisión de motor",
      "Revisión de piñon y cadena",
      "Revisión de cilindro hidráulico",
      "Revisión de flexibles",
      "Rev. Rotulas y conectores",
      "Rev. De ruedas y riel",
      "Lubricación de partes móviles"
    ]
  },
  {
    equipo: "DESENROLLADOR DE BOBINA",
    revisiones: [
      "Rev. Estructural",
      "Rev. Motorreductor",
      "Rev. Piñon motriz y piñon conductor",
      "Rev. Cadena doble transmisión",
      "Rev. Cilindros hidráulicos",
      "Rev. de Flexibles Hidráulicos",
      "Rev. De F.L.R",
      "Rev. Sistema de freno",
      "Reparación de pernos",
      "Rev. Gabinete eléctrico",
      "Rev. De sensores y actuadores",
      "Rev. Central hidráulica",
      "Lubricación de partes móviles"
    ]
  },
  {
    equipo: "MESA CONFORMADORA",
    revisiones: [
      "Rev. Estructura de motor y parametros",
      "Rev. Piñon motriz y conducido",
      "Rev. De cajas de transmisión",
      "Rev. De machones de acoplamiento",
      "Rev. Central de lubricación",
      "Rev. de Flexibles hidráulicos",
      "Rev de rodillos conformadores",
      "Sistema ajuste altura de rodillos",
      "Rev. Rodillos conformadores.",
      "Lubricación de partes móviles",
      "Reparación de pernos"
    ]
  },
  {
    equipo: "GUILLOTINA",
    revisiones: [
      "Rev. de cuchillos",
      "Rev. De prensa chapa",
      "Rev. Motorreductor superior",
      "Rev. Servomotor",
      "Rev. De carros lineales",
      "rev. Sin fin",
      "Rev sensores fines de carrera",
      "Rev. Sistema soporte cilindro",
      "Reparación de pernos",
      "Lubricación de partes móviles"
    ]
  },
  {
    equipo: "CINTA TRANSPORTADORA",
    revisiones: [
      "Rev. Estado general de cinta",
      "rev. De sensores",
      "Rev. De rodillos",
      "Rev. De motor",
      "Rev. Piñon motriz y conductor",
      "Rev. Cadenas de Transmisión",
      "Reparación de pernos"
    ]
  },
  {
    equipo: "STACKER",
    revisiones: [
      "Rev de fugas de aire",
      "Rev. de sensores y actuador",
      "Rev. De cadenas",
      "Rev. de motorreductor",
      "Rev. De piñon motriz y conducido",
      "Rev. De rodamientos",
      "Reparación de pernos",
      "Lubricación de partes móviles"
    ]
  }
];

const tbody = document.getElementById('checklist-body');

data.forEach(({ equipo, revisiones }) => {
  const sectionRow = document.createElement('tr');
  const sectionCell = document.createElement('td');
  sectionCell.innerHTML = `<strong>${equipo}</strong>`;
  sectionCell.colSpan = 8;
  sectionCell.style.backgroundColor = '#f2f2f2';
  sectionRow.appendChild(sectionCell);
  tbody.appendChild(sectionRow);

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
      <td><textarea rows="2"></textarea></td>
    `;
    tbody.appendChild(row);
  });
});
