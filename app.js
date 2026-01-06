import { auth, db, signInWithGoogle, signOutUser, watchAuth } from './firebase.js';
import { collection, addDoc, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

let currentUser=null; let currentLrId=null;

const signInBtn=document.getElementById('signInBtn');
const signOutBtn=document.getElementById('signOutBtn');
const saveLrBtn=document.getElementById('saveLrBtn');
const newLrBtn=document.getElementById('newLrBtn');
const shareLrBtn=document.getElementById('shareLrBtn');
const printLrBtn=document.getElementById('printLrBtn');
const lrForm=document.getElementById('lrForm');
const previewFrame=document.getElementById('previewFrame');

const consignorSelect=document.getElementById('consignorSelect');
const consigneeSelect=document.getElementById('consigneeSelect');
const fromSelect=document.getElementById('fromSelect');
const toSelect=document.getElementById('toSelect');

const addItemBtn=document.getElementById('addItemBtn');
const itemsTableBody=document.querySelector('#itemsTable tbody');

const companyNameInput=document.getElementById('companyName');
const companyAddressInput=document.getElementById('companyAddress');
const companyEmailInput=document.getElementById('companyEmail');
const companyPhoneInput=document.getElementById('companyPhone');
const companyPANInput=document.getElementById('companyPAN');
const companyGSTINInput=document.getElementById('companyGSTIN');
const templateUrlInput=document.getElementById('templateUrl');

function renderItemsRow(row={}){
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input name="pkgQty"/></td>
                <td><input name="materialType"/></td>
                <td><input name="description"/></td>
                <td><input name="weight" type="number" step="0.01"/></td>
                <td><button type="button" class="secondary small remove-row">Remove</button></td>`;
  tr.querySelector('.remove-row').addEventListener('click',()=>tr.remove());
  itemsTableBody.appendChild(tr);
}
renderItemsRow();
addItemBtn.addEventListener('click',()=>renderItemsRow());

function formData(){
  const fd=new FormData(lrForm); const json={};
  for(const [k,v] of fd.entries()) json[k]=v;
  json.items=[]; itemsTableBody.querySelectorAll('tr').forEach(tr=>{
    json.items.push({
      pkgQty: tr.querySelector('input[name="pkgQty"]').value||'',
      materialType: tr.querySelector('input[name="materialType"]').value||'',
      description: tr.querySelector('input[name="description"]').value||'',
      weight: tr.querySelector('input[name="weight"]').value||''
    });
  });
  json.company={
    name: companyNameInput.value||'', address: companyAddressInput.value||'',
    email: companyEmailInput.value||'', phone: companyPhoneInput.value||'',
    pan: companyPANInput.value||'', gstin: companyGSTINInput.value||'',
    templateUrl: templateUrlInput.value||''
  };
  return json;
}

function initPreview(){ previewFrame.src='view.html'; previewFrame.addEventListener('load',()=>updatePreview()); }
function updatePreview(){ const d=formData(); const doc=previewFrame.contentDocument; if(!doc) return;
  const canvas=doc.getElementById('canvas');
  if(d.company.templateUrl) canvas.style.backgroundImage=`url('${d.company.templateUrl}')`;
  const set=(id,val)=>{ const el=doc.getElementById(id); if(el) el.textContent=val||''; };
  set('cnNoteNo', d.cnNoteNo); set('date', d.date); set('paymentTerm', d.paymentTerm);
  set('consignor', d.consignor); set('consignorAddress', d.consignorAddress);
  set('consignee', d.consignee); set('consigneeAddress', d.consigneeAddress);
  set('fromLocation', d.fromLocation); set('toLocation', d.toLocation);
  set('invoiceNo', d.invoiceNo); set('invoiceDate', d.invoiceDate);
  set('vehicleNo', d.vehicleNo); set('vehicleType', d.vehicleType); set('charges', d.charges);
  set('remarks', d.remarks); set('serviceTaxBy', d.serviceTaxBy); set('value', d.value);
  // Items as multi-line block
  const itemsEl=doc.getElementById('items');
  itemsEl.textContent=d.items.map(i=>`${i.pkgQty}\t${i.materialType}\t${i.description}\t${i.weight}`).join('\n');
}
lrForm.addEventListener('input', updatePreview);

signInBtn.addEventListener('click', async()=>{ try{ await signInWithGoogle(); }catch(e){ alert(e.message);} });
signOutBtn.addEventListener('click', async()=>{ await signOutUser(); });
watchAuth(u=>{ currentUser=u; signOutBtn.hidden=!u; signInBtn.hidden=!!u; saveLrBtn.disabled=!u; updatePreview(); });

newLrBtn.addEventListener('click',()=>{ lrForm.reset(); itemsTableBody.innerHTML=''; renderItemsRow(); currentLrId=null; updatePreview(); });

saveLrBtn.addEventListener('click', async()=>{
  if(!currentUser) return alert('Sign in first');
  const data=formData(); data.ownerUid=currentUser.uid; data.createdAt=Date.now();
  if(!currentLrId){ const ref=await addDoc(collection(db,'lrs'), data); currentLrId=ref.id; }
  else { await updateDoc(doc(db,'lrs',currentLrId), data); }
  shareLrBtn.disabled=true; shareLrBtn.disabled=false; alert('Saved');
});

shareLrBtn.addEventListener('click', async()=>{ if(!currentLrId) return; const base=location.href.replace('index.html',''); const link=base+'view.html?lrId='+encodeURIComponent(currentLrId); await navigator.clipboard.writeText(link); alert('Link copied:\n'+link); });
printLrBtn.addEventListener('click',()=>{ previewFrame.contentWindow.print(); });

async function loadPresets(){ const kinds=['consignors','consignees','locations','vehicleTypes']; const stores={};
  for(const k of kinds){ const snap=await getDocs(collection(db,'presets',k,'items')); stores[k]=snap.docs.map(d=>d.data()); }
  consignorSelect.innerHTML=''; stores.consignors.forEach(x=>{ const o=document.createElement('option'); o.value=x.name; o.textContent=x.name; consignorSelect.appendChild(o); });
  consigneeSelect.innerHTML=''; stores.consignee?.forEach?.(()=>{}); // safeguard
  stores.consignees.forEach(x=>{ const o=document.createElement('option'); o.value=x.name; o.textContent=x.name; consigneeSelect.appendChild(o); });
  fromSelect.innerHTML=''; toSelect.innerHTML=''; stores.locations.forEach(x=>{ const o1=document.createElement('option'); o1.value=x.name; o1.textContent=x.name; fromSelect.appendChild(o1); const o2=document.createElement('option'); o2.value=x.name; o2.textContent=x.name; toSelect.appendChild(o2); });
}

initPreview();
loadPresets();
