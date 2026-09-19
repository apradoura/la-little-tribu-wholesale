
const DEFAULT_COPY={
  headline:"Le showroom professionnel de La Little Tribu.",
  intro:"Une sélection réservée aux boutiques, concept stores et partenaires qui aiment les bijoux et accessoires avec une vraie personnalité.",
  season:"Preview revendeurs · Automne/Hiver 2026"
};
const state={
  copy:JSON.parse(localStorage.getItem("llt_copy")||"null")||DEFAULT_COPY,
  lead:JSON.parse(localStorage.getItem("llt_lead")||"null"),
  selection:JSON.parse(localStorage.getItem("llt_selection")||"[]"),
  products:[],
  category:"Tous"
};
const qs=new URLSearchParams(location.search);
const campaign={
  source:qs.get("utm_source")||qs.get("src")||"direct",
  medium:qs.get("utm_medium")||"web",
  campaign:qs.get("utm_campaign")||"wholesale_preview"
};
async function init(){
  try{state.products=await fetch("products.json").then(r=>r.json())}
  catch(e){state.products=[]}
  render();
}
function saveLead(form){
  const data=Object.fromEntries(new FormData(form).entries());
  state.lead={...data,...campaign,created_at:new Date().toISOString()};
  localStorage.setItem("llt_lead",JSON.stringify(state.lead));
  track("lead_created",{city:data.city,shop:data.shop});
  render();
}
function track(type,payload={}){
  const events=JSON.parse(localStorage.getItem("llt_events")||"[]");
  events.push({type,at:new Date().toISOString(),...campaign,...payload});
  localStorage.setItem("llt_events",JSON.stringify(events));
}
function addItem(id){
  const p=state.products.find(x=>x.id===id);
  const variant=document.querySelector(`[data-variant="${id}"]`).value;
  const qty=Number(document.querySelector(`[data-qty="${id}"]`).value||1);
  const existing=state.selection.find(x=>x.id===id&&x.variant===variant);
  if(existing) existing.qty+=qty; else state.selection.push({id,name:p.name,variant,qty});
  localStorage.setItem("llt_selection",JSON.stringify(state.selection));
  track("add_to_selection",{product:id,variant,qty});
  render();
}
function exportLead(){
  const payload={lead:state.lead,campaign,selection:state.selection,events:JSON.parse(localStorage.getItem("llt_events")||"[]")};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="LLT_lead_selection.json";a.click();
}
function exportConfig(){
  const blob=new Blob([JSON.stringify(state.copy,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="LLT_copy_config.json";a.click();
}
function saveCopy(){
  state.copy.headline=document.querySelector("#editHeadline").value;
  state.copy.intro=document.querySelector("#editIntro").value;
  state.copy.season=document.querySelector("#editSeason").value;
  localStorage.setItem("llt_copy",JSON.stringify(state.copy));
  render();
}
function leadModal(){
  return `<div class="modal"><div class="modal-card">
    <div class="eyebrow">Accès professionnel</div><h2>Entrez dans le showroom.</h2>
    <p>Quelques informations nous permettent de réserver cet espace aux professionnels et de retrouver votre sélection.</p>
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
      <label class="tiny" style="display:block;margin:15px 0"><input type="checkbox" required> J’accepte que La Little Tribu utilise ces informations pour répondre à ma demande professionnelle et assurer le suivi commercial.</label>
      <button class="btn" style="width:100%">Accéder au showroom</button>
    </form>
    <p class="tiny">Prototype : les données sont conservées uniquement dans ce navigateur. Le branchement Shopify/CRM viendra après validation du parcours.</p>
  </div></div>`
}
function productCard(p){
  return `<article class="product">
   <div class="visual">${p.name.slice(0,2).toUpperCase()}</div>
   <div class="info">
    <div class="meta"><span>${p.category}</span><span>${p.public_price}</span></div>
    <h3>${p.name}</h3>
    <div class="tiny">Tarif revendeur après validation du compte professionnel.</div>
    <select data-variant="${p.id}">${p.variants.map(v=>`<option>${v}</option>`).join("")}</select>
    <input data-qty="${p.id}" type="number" min="1" value="1" aria-label="Quantité">
    <button class="btn" style="width:100%;margin-top:10px" onclick="addItem('${p.id}')">Ajouter à ma sélection</button>
   </div></article>`
}
function drawer(){
  const rows=state.selection.map((x,i)=>`<div class="row"><strong>${x.name}</strong><div class="tiny">${x.variant} · quantité ${x.qty}</div><button class="pill" onclick="state.selection.splice(${i},1);localStorage.setItem('llt_selection',JSON.stringify(state.selection));render()">Retirer</button></div>`).join("");
  return `<aside class="drawer"><div class="drawer-head"><h2>Ma sélection</h2><button class="pill" onclick="document.querySelector('.drawer').remove()">Fermer</button></div>${rows||"<p>Aucune pièce sélectionnée.</p>"}<hr><button class="btn" style="width:100%" onclick="exportLead()">Exporter la fiche prospect + sélection</button><p class="tiny">Dans la version Shopify, cette étape deviendra une demande de compte ou une commande selon le statut du revendeur.</p></aside>`
}
function render(){
 const edit=qs.get("edit")==="1";
 const categories=["Tous",...new Set(state.products.map(p=>p.category))];
 const filtered=state.category==="Tous"?state.products:state.products.filter(p=>p.category===state.category);
 document.querySelector("#app").innerHTML=`
  <header class="top"><div class="wrap nav"><div class="logo">La Little Tribu <small>WHOLESALE</small></div><div><span class="pill hide-mobile">${state.lead?state.lead.shop:"Accès professionnel"}</span> <button class="pill" onclick="document.body.insertAdjacentHTML('beforeend',drawer())">Ma sélection (${state.selection.reduce((a,b)=>a+b.qty,0)})</button></div></div></header>
  <main>
   <section class="wrap hero">
    <div><div class="eyebrow">${state.copy.season}</div><h1>${state.copy.headline}</h1><p class="lead">${state.copy.intro}</p><div class="cta"><button class="btn" onclick="document.querySelector('#showroom').scrollIntoView({behavior:'smooth'})">Découvrir la sélection</button><a class="btn secondary" href="https://lalittletribu.fr" target="_blank">Voir la marque</a></div></div>
    <div class="hero-art"></div>
   </section>
   <section class="band"><div class="wrap three"><div class="card"><div class="eyebrow">01</div><h3>Découvrir</h3><p>Un univers éditorial pensé pour les concept stores et boutiques indépendantes.</p></div><div class="card"><div class="eyebrow">02</div><h3>Composer</h3><p>Choisir les références, variantes et quantités sans perdre le fil.</p></div><div class="card"><div class="eyebrow">03</div><h3>Commander</h3><p>Après validation : prix professionnels, conditions et commande Shopify.</p></div></div></section>
   ${edit?`<section class="wrap edit"><div class="eyebrow">Mode édition Barbara</div><h3>Modifier les textes de la V0.1</h3><label class="field">Saison / surtitre<input id="editSeason" value="${state.copy.season.replaceAll('"','&quot;')}"></label><label class="field">Titre<input id="editHeadline" value="${state.copy.headline.replaceAll('"','&quot;')}"></label><label class="field">Introduction<textarea id="editIntro">${state.copy.intro}</textarea></label><div class="cta"><button class="btn" onclick="saveCopy()">Enregistrer dans ce navigateur</button><button class="btn secondary" onclick="exportConfig()">Exporter la configuration</button></div></section>`:""}
   <section id="showroom" class="wrap"><div class="shop-head"><div><div class="eyebrow">Nouveautés</div><h2>Composer votre sélection</h2></div><div class="filters">${categories.map(c=>`<button class="pill" onclick="state.category='${c}';render()">${c}</button>`).join("")}</div></div><div class="products">${filtered.map(productCard).join("")}</div></section>
  </main>
  ${state.selection.length?`<div class="selectbar"><span><strong>${state.selection.reduce((a,b)=>a+b.qty,0)} pièce(s)</strong> dans votre sélection</span><button class="btn" onclick="document.body.insertAdjacentHTML('beforeend',drawer())">Voir la sélection</button></div>`:""}
  ${state.lead?"":leadModal()}
 `;
}
init();
