import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

function set(id,val){ const el=document.getElementById(id); if(el) el.textContent=val||''; }
function getParam(n){ return new URL(location.href).searchParams.get(n); }

async function load(){
  const lrId=getParam('lrId'); if(!lrId) return;
  const snap=await getDoc(doc(db,'lrs',lrId)); if(!snap.exists()) return;
  const d=snap.data();
  const canvas=document.getElementById('canvas'); if(d.company?.templateUrl) canvas.style.backgroundImage=`url('${d.company.templateUrl}')`;
  set('cnNoteNo', d.cnNoteNo); set('date', d.date); set('paymentTerm', d.paymentTerm);
  set('consignor', d.consignor); set('consignorAddress', d.consignorAddress);
  set('consignee', d.consignee); set('consigneeAddress', d.consigneeAddress);
  set('fromLocation', d.fromLocation); set('toLocation', d.toLocation);
  set('invoiceNo', d.invoiceNo); set('invoiceDate', d.invoiceDate);
  set('vehicleNo', d.vehicleNo); set('vehicleType', d.vehicleType); set('charges', d.charges);
  set('remarks', d.remarks); set('serviceTaxBy', d.serviceTaxBy); set('value', d.value);
  const itemsEl=document.getElementById('items'); itemsEl.textContent=(d.items||[]).map(i=>`${i.pkgQty}\t${i.materialType}\t${i.description}\t${i.weight}`).join('\n');
  // Create overlay elements dynamically if not present
}

// Create overlay fields
const ids=['cnNoteNo','date','paymentTerm','consignor','consignorAddress','consignee','consigneeAddress','fromLocation','toLocation','invoiceNo','invoiceDate','items','vehicleNo','vehicleType','charges','remarks','serviceTaxBy','value'];
const canvas=document.getElementById('canvas');
ids.forEach(id=>{ const div=document.createElement('div'); div.className='field'; div.id=id; canvas.appendChild(div); });

load();
