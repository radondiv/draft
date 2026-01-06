import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

async function loadLR() {
  const lrId = getParam('lrId');
  if (!lrId) return;
  const snap = await getDoc(doc(db, 'lrs', lrId));
  if (!snap.exists()) return;
  const data = snap.data();
  // Fill
  document.getElementById('companyNameText').textContent = data.company?.name || '';
  document.getElementById('companyAddressText').textContent = data.company?.address || '';
  document.getElementById('companyEmailText').textContent = data.company?.email || '';
  document.getElementById('companyPhoneText').textContent = data.company?.phone || '';
  document.getElementById('companyPANText').textContent = data.company?.pan || '';
  document.getElementById('companyGSTINText').textContent = data.company?.gstin || '';

  document.getElementById('cnNoteNoText').textContent = data.cnNoteNo || '';
  document.getElementById('dateText').textContent = data.date || '';
  document.getElementById('paymentTermText').textContent = data.paymentTerm || '';

  document.getElementById('consignorText').textContent = data.consignor || '';
  document.getElementById('consignorAddressText').textContent = data.consignorAddress || '';
  document.getElementById('consigneeText').textContent = data.consignee || '';
  document.getElementById('consigneeAddressText').textContent = data.consigneeAddress || '';

  document.getElementById('fromLocationText').textContent = data.fromLocation || '';
  document.getElementById('toLocationText').textContent = data.toLocation || '';
  document.getElementById('invoiceNoText').textContent = data.invoiceNo || '';
  document.getElementById('invoiceDateText').textContent = data.invoiceDate || '';

  document.getElementById('insuredText').textContent = (data.insured === 'yes' ? 'He has insured the consignment.' : 'He has not insured the consignment.');
  document.getElementById('insuranceCompanyText').textContent = data.insuranceCompany || '';
  document.getElementById('insuranceAmountText').textContent = data.insuranceAmount || '';
  document.getElementById('policyNoText').textContent = data.policyNo || '';
  document.getElementById('insuranceRiskText').textContent = data.insuranceRisk || '';

  document.getElementById('vehicleNoText').textContent = data.vehicleNo || '';
  document.getElementById('vehicleTypeText').textContent = data.vehicleType || '';
  document.getElementById('chargesText').textContent = data.charges || '';
  document.getElementById('remarksText').textContent = data.remarks || '';
  document.getElementById('serviceTaxByText').textContent = data.serviceTaxBy || '';
  document.getElementById('valueText').textContent = data.value || '';

  const tbody = document.getElementById('itemsBody');
  tbody.innerHTML = '';
  (data.items||[]).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.pkgQty||''}</td><td>${item.materialType||''}</td><td>${item.description||''}</td><td>${item.weight||''}</td>`;
    tbody.appendChild(tr);
  });
}

loadLR();
