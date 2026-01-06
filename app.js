import { auth, db, storage, signInWithGoogle, signOutUser, watchAuth } from './firebase.js';
import { 
  collection, addDoc, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, query, where
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// State
let currentUser = null;
let currentLrId = null;

// Elements
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const saveLrBtn = document.getElementById('saveLrBtn');
const newLrBtn = document.getElementById('newLrBtn');
const shareLrBtn = document.getElementById('shareLrBtn');
const printLrBtn = document.getElementById('printLrBtn');
const authPanel = document.getElementById('authPanel');
const userEmailEl = document.getElementById('userEmail');
const lrForm = document.getElementById('lrForm');
const previewFrame = document.getElementById('previewFrame');

// Preset controls
const consignorSelect = document.getElementById('consignorSelect');
const consigneeSelect = document.getElementById('consigneeSelect');
const fromSelect = document.getElementById('fromSelect');
const toSelect = document.getElementById('toSelect');
const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');

// Settings inputs
const companyNameInput = document.getElementById('companyName');
const companyAddressInput = document.getElementById('companyAddress');
const companyEmailInput = document.getElementById('companyEmail');
const companyPhoneInput = document.getElementById('companyPhone');
const companyPANInput = document.getElementById('companyPAN');
const companyGSTINInput = document.getElementById('companyGSTIN');

// Presets sections
const consignorList = document.getElementById('consignorList');
const consigneeList = document.getElementById('consigneeList');
const locationList = document.getElementById('locationList');
const vehicleTypeList = document.getElementById('vehicleTypeList');
const materialTypeList = document.getElementById('materialTypeList');

const addConsignorBtn = document.getElementById('addConsignorBtn');
const addConsigneeBtn = document.getElementById('addConsigneeBtn');
const addLocationBtn = document.getElementById('addLocationBtn');
const addVehicleTypeBtn = document.getElementById('addVehicleTypeBtn');
const addMaterialTypeBtn = document.getElementById('addMaterialTypeBtn');

const newConsignorName = document.getElementById('newConsignorName');
const newConsignorAddress = document.getElementById('newConsignorAddress');
const newConsigneeName = document.getElementById('newConsigneeName');
const newConsigneeAddress = document.getElementById('newConsigneeAddress');
const newLocation = document.getElementById('newLocation');
const newVehicleType = document.getElementById('newVehicleType');
const newMaterialType = document.getElementById('newMaterialType');

// Items table
const itemsTableBody = document.querySelector('#itemsTable tbody');
const addItemBtn = document.getElementById('addItemBtn');

// Helpers
function formDataToJSON(form) {
  const data = new FormData(form);
  const json = {};
  for (const [k, v] of data.entries()) { json[k] = v; }
  json.items = [];
  itemsTableBody.querySelectorAll('tr').forEach(tr => {
    const pkgQty = tr.querySelector('input[name="pkgQty"]').value || '';
    const materialType = tr.querySelector('select[name="materialType"]').value || '';
    const description = tr.querySelector('input[name="description"]').value || '';
    const weight = parseFloat(tr.querySelector('input[name="weight"]').value || '');
    json.items.push({ pkgQty, materialType, description, weight });
  });
  // Company settings
  json.company = {
    name: companyNameInput.value || 'JAI AMBEY LOGISTICS SERVICE',
    address: companyAddressInput.value || '',
    email: companyEmailInput.value || '',
    phone: companyPhoneInput.value || '',
    pan: companyPANInput.value || '',
    gstin: companyGSTINInput.value || ''
  };
  return json;
}

function renderItemsRow(rowData = {pkgQty:'', materialType:'', description:'', weight:''}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" name="pkgQty" placeholder="e.g. 10" value="${rowData.pkgQty}" /></td>
    <td>
      <select name="materialType" class="material-type-select"></select>
    </td>
    <td><input type="text" name="description" placeholder="Description" value="${rowData.description}" /></td>
    <td><input type="number" name="weight" step="0.01" placeholder="kg" value="${rowData.weight}" /></td>
    <td><button type="button" class="secondary small remove-row">Remove</button></td>
  `;
  tr.querySelector('.remove-row').addEventListener('click', () => tr.remove());
  itemsTableBody.appendChild(tr);
  populateMaterialTypeSelects();
}

function updatePreview() {
  const data = formDataToJSON(lrForm);
  const doc = previewFrame.contentDocument;
  if (!doc) return;
  doc.getElementById('companyNameText').textContent = data.company.name;
  doc.getElementById('companyAddressText').textContent = data.company.address;
  doc.getElementById('companyEmailText').textContent = data.company.email;
  doc.getElementById('companyPhoneText').textContent = data.company.phone;
  doc.getElementById('companyPANText').textContent = data.company.pan;
  doc.getElementById('companyGSTINText').textContent = data.company.gstin;

  doc.getElementById('cnNoteNoText').textContent = data.cnNoteNo || '';
  doc.getElementById('dateText').textContent = data.date || '';
  doc.getElementById('paymentTermText').textContent = data.paymentTerm || '';

  doc.getElementById('consignorText').textContent = lrForm.consignor.value || '';
  doc.getElementById('consignorAddressText').textContent = lrForm.consignorAddress.value || '';
  doc.getElementById('consigneeText').textContent = lrForm.consignee.value || '';
  doc.getElementById('consigneeAddressText').textContent = lrForm.consigneeAddress.value || '';

  doc.getElementById('fromLocationText').textContent = lrForm.fromLocation.value || '';
  doc.getElementById('toLocationText').textContent = lrForm.toLocation.value || '';
  doc.getElementById('invoiceNoText').textContent = lrForm.invoiceNo.value || '';
  doc.getElementById('invoiceDateText').textContent = lrForm.invoiceDate.value || '';

  doc.getElementById('insuredText').textContent = (lrForm.insured.value === 'yes' ? 'He has insured the consignment.' : 'He has not insured the consignment.');
  doc.getElementById('insuranceCompanyText').textContent = lrForm.insuranceCompany.value || '';
  doc.getElementById('insuranceAmountText').textContent = lrForm.insuranceAmount.value || '';
  doc.getElementById('policyNoText').textContent = lrForm.policyNo.value || '';
  doc.getElementById('insuranceRiskText').textContent = lrForm.insuranceRisk.value || '';

  doc.getElementById('vehicleNoText').textContent = lrForm.vehicleNo.value || '';
  doc.getElementById('vehicleTypeText').textContent = lrForm.vehicleType.value || '';
  doc.getElementById('chargesText').textContent = lrForm.charges.value || '';
  doc.getElementById('remarksText').textContent = lrForm.remarks.value || '';
  doc.getElementById('serviceTaxByText').textContent = lrForm.serviceTaxBy.value || '';
  doc.getElementById('valueText').textContent = lrForm.value.value || '';

  // Items
  const tbody = doc.getElementById('itemsBody');
  tbody.innerHTML = '';
  const dataJson = formDataToJSON(lrForm);
  dataJson.items.forEach(item => {
    const tr = doc.createElement('tr');
    tr.innerHTML = `<td>${item.pkgQty}</td><td>${item.materialType}</td><td>${item.description}</td><td>${item.weight || ''}</td>`;
    tbody.appendChild(tr);
  });

  saveLrBtn.disabled = !currentUser;
  shareLrBtn.disabled = !currentUser || !currentLrId;
  printLrBtn.disabled = !currentUser && !currentLrId; // allow print even without save
}

function initPreviewFrame() {
  previewFrame.src = 'view.html';
  previewFrame.addEventListener('load', updatePreview);
}

// Auth handlers
signInBtn.addEventListener('click', async () => {
  try {
    await signInWithGoogle();
  } catch (e) { alert('Sign-in failed: ' + e.message); }
});

signOutBtn.addEventListener('click', async () => {
  await signOutUser();
});

watchAuth(user => {
  currentUser = user;
  const signedIn = !!user;
  authPanel.hidden = !signedIn;
  signOutBtn.hidden = !signedIn;
  signInBtn.hidden = signedIn;
  if (signedIn) userEmailEl.textContent = user.email;
  updatePreview();
});

// Presets CRUD
async function loadPresets() {
  const presets = ['consignors','consignees','locations','vehicleTypes','materialTypes'];
  const stores = {};
  for (const p of presets) {
    const snap = await getDocs(collection(db, 'presets', p, 'items'));
    stores[p] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  populatePresetUI(stores);
}

function populatePresetUI(stores) {
  // Consignors
  consignorSelect.innerHTML = '';
  consignorList.innerHTML = '';
  stores.consignors.forEach(({name, address, id}) => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; consignorSelect.appendChild(opt);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div>${name}</div><div class="muted">${address||''}</div>`;
    consignorList.appendChild(row);
  });
  // Consignees
  consigneeSelect.innerHTML = '';
  consigneeList.innerHTML = '';
  stores.consignees.forEach(({name, address, id}) => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name; consigneeSelect.appendChild(opt);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div>${name}</div><div class="muted">${address||''}</div>`;
    consigneeList.appendChild(row);
  });
  // Locations
  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';
  locationList.innerHTML = '';
  stores.locations.forEach(({name}) => {
    const opt1 = document.createElement('option'); opt1.value = name; opt1.textContent = name; fromSelect.appendChild(opt1);
    const opt2 = document.createElement('option'); opt2.value = name; opt2.textContent = name; toSelect.appendChild(opt2);
    const row = document.createElement('div'); row.textContent = name; locationList.appendChild(row);
  });
  // Vehicle Types
  vehicleTypeSelect.innerHTML = '';
  vehicleTypeList.innerHTML = '';
  stores.vehicleTypes.forEach(({name}) => {
    const opt = document.createElement('option'); opt.value = name; opt.textContent = name; vehicleTypeSelect.appendChild(opt);
    const row = document.createElement('div'); row.textContent = name; vehicleTypeList.appendChild(row);
  });
  // Material Types
  materialTypeList.innerHTML = '';
  stores.materialTypes.forEach(({name}) => {
    const row = document.createElement('div'); row.textContent = name; materialTypeList.appendChild(row);
  });
  populateMaterialTypeSelects(stores.materialTypes.map(m=>m.name));
}

function populateMaterialTypeSelects(materials) {
  const options = (materials && materials.length ? materials : Array.from(materialTypeList.children).map(el=>el.textContent));
  document.querySelectorAll('.material-type-select').forEach(sel => {
    sel.innerHTML = '';
    options.forEach(name => {
      const opt = document.createElement('option'); opt.value = name; opt.textContent = name; sel.appendChild(opt);
    });
  });
}

addConsignorBtn.addEventListener('click', async () => {
  const name = newConsignorName.value.trim();
  const address = newConsignorAddress.value.trim();
  if (!name) return;
  await addDoc(collection(db, 'presets','consignors','items'), { name, address });
  newConsignorName.value = ''; newConsignorAddress.value = '';
  await loadPresets();
});
addConsigneeBtn.addEventListener('click', async () => {
  const name = newConsigneeName.value.trim();
  const address = newConsigneeAddress.value.trim();
  if (!name) return;
  await addDoc(collection(db, 'presets','consignees','items'), { name, address });
  newConsigneeName.value = ''; newConsigneeAddress.value = '';
  await loadPresets();
});
addLocationBtn.addEventListener('click', async () => {
  const name = newLocation.value.trim(); if (!name) return;
  await addDoc(collection(db, 'presets','locations','items'), { name }); newLocation.value = ''; await loadPresets();
});
addVehicleTypeBtn.addEventListener('click', async () => {
  const name = newVehicleType.value.trim(); if (!name) return;
  await addDoc(collection(db, 'presets','vehicleTypes','items'), { name }); newVehicleType.value=''; await loadPresets();
});
addMaterialTypeBtn.addEventListener('click', async () => {
  const name = newMaterialType.value.trim(); if (!name) return;
  await addDoc(collection(db, 'presets','materialTypes','items'), { name }); newMaterialType.value=''; await loadPresets();
});

// Items add
addItemBtn.addEventListener('click', () => renderItemsRow());
renderItemsRow(); // start with one row

// New LR
newLrBtn.addEventListener('click', () => {
  lrForm.reset();
  itemsTableBody.innerHTML = '';
  renderItemsRow();
  currentLrId = null;
  updatePreview();
});

// Save
saveLrBtn.addEventListener('click', async () => {
  if (!currentUser) { alert('Please sign in first.'); return; }
  const data = formDataToJSON(lrForm);
  data.ownerUid = currentUser.uid;
  data.createdAt = Date.now();
  if (!currentLrId) {
    const ref = await addDoc(collection(db, 'lrs'), data);
    currentLrId = ref.id;
  } else {
    await updateDoc(doc(db, 'lrs', currentLrId), data);
  }
  alert('LR saved.');
  shareLrBtn.disabled = false;
});

// Share link
shareLrBtn.addEventListener('click', async () => {
  if (!currentLrId) return;
  const url = new URL(window.location.href);
  const base = url.origin + url.pathname.replace(/index\.html$/, '');
  const link = base + 'view.html?lrId=' + encodeURIComponent(currentLrId);
  await navigator.clipboard.writeText(link);
  alert('Shareable link copied to clipboard:\n' + link);
});

// Print
printLrBtn.addEventListener('click', () => {
  previewFrame.contentWindow.print();
});

// Live changes
lrForm.addEventListener('input', updatePreview);

// Init
initPreviewFrame();
loadPresets();
