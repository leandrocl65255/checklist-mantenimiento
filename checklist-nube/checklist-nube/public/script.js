async function loadConfig() {
  const resp = await fetch('/api/config');
  return await resp.json();
}

function crearFilaCheck(label) {
  const wrapper = document.createElement('label');
  wrapper.innerHTML = `
    <span>${label}</span>
    <select name="check_${label}">
      <option value="">--</option>
      <option value="OK">OK</option>
      <option value="NO">NO</option>
      <option value="N/A">N/A</option>
    </select>
  `;
  return wrapper;
}

function construirChecks(checks) {
  const cont = document.getElementById('checksContainer');
  cont.innerHTML = '';
  checks.forEach(c => cont.appendChild(crearFilaCheck(c.label)));
}

function formToFormData(form, checksDef) {
  const fd = new FormData(form);
  // Build checks array from selects
  const checks = checksDef.map(c => ({
    label: c.label,
    value: fd.get('check_' + c.label) || ''
  }));
  fd.append('checks', JSON.stringify(checks));
  return fd;
}

async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const cfg = await loadConfig();
  const fd = formToFormData(form, cfg.checks || []);

  const resp = await fetch('/api/submit', {
    method: 'POST',
    body: fd
  });
  const data = await resp.json();
  const result = document.getElementById('result');
  if (data.ok) {
    result.innerHTML = \`
      <article class="success">
        <strong>\${data.message}</strong><br/>
        <a href="\${data.downloadUrl}">Descargar Excel generado</a>
      </article>\`;
  } else {
    result.innerHTML = \`
      <article class="error">
        <strong>Ocurrió un error:</strong> \${data.error || 'Desconocido'}
      </article>\`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const cfg = await loadConfig();
  construirChecks(cfg.checks || []);
  document.getElementById('formChecklist').addEventListener('submit', submitForm);
});
