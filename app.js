
const DEFAULT_COPY={
  season:"Showroom professionnel · Nouveautés",
  headline:"La Little Tribu, à découvrir en boutique.",
  intro:"Un aperçu professionnel de l’univers La Little Tribu et de ses toutes dernières créations. Explorez la collection, puis identifiez-vous pour composer votre sélection revendeur."
};
const state={
  products:[],
  category:"Tous",
  copy:JSON.parse(localStorage.getItem("llt_copy_v02")||"null")||DEFAULT_COPY,
  lead:JSON.parse(localStorage.getItem("llt_lead_v02")||"null"),
  selection:JSON.parse(localStorage.getItem("llt_selection_v02")||"[]")
};
const qs=new URLSearchParams(location.search);
const campaign={
  source:qs.get("utm_source")||qs.get("src")||"direct",
  medium:qs.get("utm_medium")||"web",
  campaign:qs.get("utm_campaign")||"wholesale_preview"
};
function track(type,payload={}){
  const k="llt_events_v02";
  const events=JSON.parse(localStorage.getItem(k)||"[]");
  events.push({type,at:new Date().toISOString(),...campaign,...payload});
  localStorage.setItem(k,JSON.stringify(events));
}
async function init(){
  state.products=await fetch("products.json").then(r=>r.json());
  track("page_view");
  render();
}
function initials(name){
  const words=name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g," ").trim().split(/\s+/);
  return words.slice(0,2).map(x=>x[0]).join("").toUpperCase();
}
function ensureLead(){
  if(state.lead) return true;
  document.body.insertAdjacentHTML("beforeend",leadModal());
  return false;
}
function saveLead(form){
  const data=Object.fromEntries(new FormData(form).entries());
  state.lead={...data,...campaign,created_at:new Date().toISOString()};
  localStorage.setItem("llt_lead_v02",JSON.stringify(state.lead));
  track("lead_created",{shop:data.shop,city:data.city});
  document.querySelector(".modal")?.remove();
  render();
  document.querySelector("#showroom")?.scrollIntoView({behavior:"smooth"});
}
function addItem(id){
  if(!ensureLead()) return;
  const p=state.products.find(x=>x.id===id);
  const variant=document.querySelector(`[data-variant="${id}"]`).value;
  const qty=Number(document.querySelector(`[data-qty="${id}"]`).value||1);
  const existing=state.selection.find(x=>x.id===id&&x.variant===variant);
  if(existing) existing.qty+=qty; else state.selection.push({id,name:p.name,variant,qty,price:p.price});
  localStorage.setItem("llt_selection_v02",JSON.stringify(state.selection));
  track("add_to_selection",{product:id,variant,qty});
  render();
}
function openSelection(){
  document.body.insertAdjacentHTML("beforeend",drawer());
}
function removeItem(i){
  state.selection.splice(i,1);
  localStorage.setItem("llt_selection_v02",JSON.stringify(state.selection));
  document.querySelector(".drawer")?.remove();
  render();
  openSelection();
}
function exportLead(){
  const payload={lead:state.lead,campaign,selection:state.selection,events:JSON.parse(localStorage.getItem("llt_events_v02")||"[]")};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="LLT_prospect_selection.json";a.click();
}
function saveCopy(){
  state.copy.season=document.querySelector("#editSeason").value;
  state.copy.headline=document.querySelector("#editHeadline").value;
  state.copy.intro=document.querySelector("#editIntro").value;
  localStorage.setItem("llt_copy_v02",JSON.stringify(state.copy)); render();
}
function leadModal(){
 return `<div class="modal"><div class="modal-card">
   <div class="eyebrow">Accès à la sélection professionnelle</div>
   <h2>Composez votre sélection.</h2>
   <p>Identifiez votre boutique pour sauvegarder vos choix et permettre à La Little Tribu de reprendre contact avec vous.</p>
   <form onsubmit="event.preventDefault();saveLead(this)">
    <div class="grid2">
     <label class="field">Prénom<input name="firstname" required></label>
     <label class="field">Nom<input name="lastname" required></label>
     <label class="field">Boutique / enseigne<input name="shop" required></label>
     <label class="field">E-mail professionnel<input name="email" type="email" required></label>
     <label class="field">Téléphone<input name="phone" type="tel"></label>
     <label class="field">Ville<input name="city" required></label>
     <label class="field">Code postal<input name="postal" required></label>
     <label class="field">Type de point de vente<select name="type"><option>Concept store</option><option>Boutique bijoux / accessoires</option><option>Boutique mode</option><option>Grand magasin</option><option>Autre</option></select></label>
    </div>
    <label class="tiny" style="display:block;margin:15px 0"><input type="checkbox" required> J’accepte que ces informations soient utilisées pour répondre à ma demande professionnelle et assurer le suivi commercial.</label>
    <button class="btn" style="width:100%">Continuer vers ma sélection</button>
   </form>
   <p class="tiny">Prototype : les données restent actuellement dans ce navigateur. Elles ne sont pas encore envoyées à La Little Tribu.</p>
 </div></div>`;
}
function card(p){
 return `<article class="product">
  <div class="visual">
   <div class="shape s1"></div><div class="shape s2"></div>
   <div class="initials">${initials(p.name)}</div>
   <div class="badge">NOUVEAUTÉ</div>
  </div>
  <div class="info">
   <div class="meta"><span>${p.category}</span><span>${p.price}</span></div>
   <h3>${p.name}</h3>
   <div class="note">${p.note}</div>
   <a class="link" href="${p.source}" target="_blank" rel="noopener" onclick="track('source_click',{product:'${p.id}'})">Voir la fiche LLT ↗</a>
   <div class="controls">
    <select data-variant="${p.id}">${p.variants.map(v=>`<option>${v}</option>`).join("")}</select>
    <input data-qty="${p.id}" type="number" min="1" value="1" aria-label="Quantité">
    <div class="locked">Prix revendeur et conditions commerciales après validation du compte professionnel.</div>
    <button class="btn" style="width:100%;margin-top:10px" onclick="addItem('${p.id}')">${state.lead?"Ajouter à ma sélection":"Composer ma sélection"}</button>
   </div>
  </div>
 </article>`;
}
function drawer(){
 const rows=state.selection.map((x,i)=>`<div class="row"><strong>${x.name}</strong><div class="tiny">${x.variant} · quantité ${x.qty}</div><button class="pill" onclick="removeItem(${i})">Retirer</button></div>`).join("");
 return `<aside class="drawer">
  <div class="drawer-head"><div><div class="eyebrow">Revendeur</div><h2>Ma sélection</h2></div><button class="pill" onclick="this.closest('.drawer').remove()">Fermer</button></div>
  ${state.lead?`<p class="tiny">${state.lead.shop} · ${state.lead.city}</p>`:""}
  ${rows||"<p>Aucune pièce sélectionnée.</p>"}
  <div class="locked">V0.2 : cette sélection sera ensuite rattachée au compte / lead Shopify.</div>
  <button class="btn" style="width:100%;margin-top:14px" onclick="exportLead()">Exporter la sélection test</button>
 </aside>`;
}
function render(){
 const edit=qs.get("edit")==="1";
 const cats=["Tous",...new Set(state.products.map(x=>x.category))];
 const filtered=state.category==="Tous"?state.products:state.products.filter(x=>x.category===state.category);
 const count=state.selection.reduce((a,b)=>a+b.qty,0);
 document.querySelector("#app").innerHTML=`
 <header class="top"><div class="wrap nav">
  <div class="logo">La Little Tribu <small>WHOLESALE</small></div>
  <div><span class="pill hide-mobile">${state.lead?state.lead.shop:"Espace professionnel"}</span> <button class="pill" onclick="openSelection()">Ma sélection (${count})</button></div>
 </div></header>
 <main>
  <section class="wrap hero">
   <div>
    <div class="eyebrow">${state.copy.season}</div>
    <h1>${state.copy.headline}</h1>
    <p class="lead">${state.copy.intro}</p>
    <div class="cta"><a class="btn" href="#showroom">Découvrir les nouveautés</a><a class="btn secondary" href="https://lalittletribu.fr" target="_blank">Voir La Little Tribu</a></div>
   </div>
   <div class="hero-art"><div class="orb a"></div><div class="orb b"></div><div class="orb c"></div><div class="orb d"></div><span>Little Tribu</span></div>
  </section>
  <section class="preview-strip"><div class="wrap strip-grid">
   <div class="strip-card big"><div class="eyebrow" style="color:#f2d8df">Pour les professionnels</div><h3>Découvrir avant de s’identifier.</h3><p>Le prospect voit l’univers et les nouveautés. L’identification n’intervient que lorsqu’il souhaite composer sa sélection.</p></div>
   <div class="strip-card"><div class="eyebrow">Catalogue pilote</div><h3>11 nouveautés</h3><p>Uniquement la collection actuellement publiée dans “Nouveautés” sur lalittletribu.fr.</p></div>
   <div class="strip-card"><div class="eyebrow">Étape suivante</div><h3>Shopify comme source de vérité</h3><p>Images, variantes, disponibilité et futures conditions B2B seront branchées au catalogue réel.</p></div>
  </div></section>
  ${edit?`<section class="wrap edit"><div class="eyebrow">Mode édition Barbara</div><h3>Textes d’accueil</h3><label class="field">Surtitre<input id="editSeason" value="${state.copy.season.replaceAll('"','&quot;')}"></label><label class="field">Titre<input id="editHeadline" value="${state.copy.headline.replaceAll('"','&quot;')}"></label><label class="field">Introduction<textarea id="editIntro">${state.copy.intro}</textarea></label><button class="btn" onclick="saveCopy()">Enregistrer dans ce navigateur</button></section>`:""}
  <section id="showroom" class="wrap section">
   <div class="section-head"><div><div class="eyebrow">La collection du moment</div><h2>Nouveautés</h2><p class="lead" style="font-size:16px">Une première sélection pilote issue du catalogue LLT actuel.</p></div>
   <div class="filters">${cats.map(c=>`<button class="pill ${state.category===c?"active":""}" onclick="state.category='${c}';render();document.querySelector('#showroom').scrollIntoView()">${c}</button>`).join("")}</div></div>
   <div class="products">${filtered.map(card).join("")}</div>
  </section>
 </main>
 ${count?`<div class="selectbar"><span><strong>${count} pièce(s)</strong> sélectionnée(s)</span><button class="btn" onclick="openSelection()">Voir ma sélection</button></div>`:""}
 `;
}
init();
