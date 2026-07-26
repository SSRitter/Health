
const K={meals:"hm21-meals",plan:"hm21-plan",checks:"hm21-checks",view:"hm21-view",shop:"hm21-shop"};
const categories=["All","Favorites","Breakfast","Lunch","Dinner","Snack","Archived"];
const slots=["Breakfast","Snack 1","Lunch","Snack 2"];
const slotCat={"Breakfast":"Breakfast","Lunch":"Lunch","Snack 1":"Snack","Snack 2":"Snack"};

const seedMeals=[
{id:"egg-toast",name:"Eggs + Toast + Berries",category:"Breakfast",ingredients:["3 eggs","Whole-grain or sourdough toast","Blueberries or strawberries"],notes:"",favorite:true,archived:false},
{id:"yogurt-bowl",name:"Greek Yogurt Bowl",category:"Breakfast",ingredients:["Plain Greek yogurt","Blueberries and/or strawberries","Granola","Chia seeds"],notes:"Chia seeds are standard.",favorite:true,archived:false},
{id:"rainbow-cups",name:"Rainbow Egg Cups",category:"Breakfast",ingredients:["Eggs","Turkey ham or turkey sausage","Bell peppers","Spinach","Garlic powder","Salt","Pepper","Avocado oil spray"],notes:"Meal-prep breakfast.",favorite:true,archived:false},
{id:"protein-oatmeal",name:"Protein Oatmeal",category:"Breakfast",ingredients:["Old-fashioned oats","Protein powder","Blueberries","Chia seeds","Almond butter","Cinnamon"],notes:"About once per month.",favorite:false,archived:false},
{id:"turkey-sandwich",name:"Turkey Sandwich",category:"Lunch",ingredients:["Whole-grain bread","Turkey breast","Lettuce","Tomato","Mustard","Baby carrots","Apple"],notes:"No raw onion.",favorite:true,archived:false},
{id:"chicken-rice",name:"Chicken Rice Bowl",category:"Lunch",ingredients:["Chicken breast","Brown rice","Broccoli","Bell peppers","Avocado oil","Garlic"],notes:"",favorite:true,archived:false},
{id:"chicken-salad",name:"Big Chicken Salad",category:"Lunch",ingredients:["Grilled chicken","Romaine","Spinach","Cucumber","Tomatoes","Bell peppers","Walnuts","Olive oil","Balsamic vinegar"],notes:"No raw onion.",favorite:false,archived:false},
{id:"turkey-chili",name:"Turkey Chili + Rice",category:"Lunch",ingredients:["Lean ground turkey","Beans","Tomatoes","Bell peppers","Garlic","Brown rice"],notes:"No raw onion.",favorite:false,archived:false},
{id:"chomps",name:"Chomps",category:"Snack",ingredients:["Chomps meat stick"],notes:"",favorite:true,archived:false},
{id:"perfect-bar",name:"Perfect Bar",category:"Snack",ingredients:["Perfect Bar"],notes:"",favorite:true,archived:false},
{id:"g2g",name:"G2G Bar",category:"Snack",ingredients:["G2G Bar"],notes:"",favorite:true,archived:false},
{id:"edamame",name:"Dry Roasted Edamame",category:"Snack",ingredients:["Dry roasted edamame"],notes:"",favorite:true,archived:false},
{id:"apple-almond",name:"Apple + Almond Butter",category:"Snack",ingredients:["Apple","Almond butter"],notes:"",favorite:false,archived:false},
{id:"popcorn",name:"Clean Avocado-Oil Popcorn",category:"Snack",ingredients:["Popcorn made with avocado oil and no seed oils"],notes:"",favorite:true,archived:false},
{id:"eggs-snack",name:"Hard-Boiled Eggs",category:"Snack",ingredients:["2 hard-boiled eggs"],notes:"",favorite:false,archived:false},
{id:"walnuts",name:"Walnuts",category:"Snack",ingredients:["Walnuts"],notes:"",favorite:false,archived:false}
];

const meds={"Breakfast":["Creatine","Vitamin D/K2","Amlodipine","Duloxetine","Pravastatin"],"Lunch":["Mesalamine"],"Evening":["Magnesium glycinate","Cortisol Manager"],"Before bed":["Melatonin"]};
const prepItems=["Make rainbow egg cups","Hard boil eggs","Cook chicken breast","Brown lean ground turkey","Cook brown rice","Wash and chop vegetables","Portion snacks","Set out medications and supplements"];

let meals=load(K.meals,seedMeals);
let plan=load(K.plan,seedPlan());
let checks=load(K.checks,{});
let shopChecks=load(K.shop,{});
let view=localStorage.getItem(K.view)||"week";
let anchor=day0(new Date());
let filter="All";
let editing=null;
let swapCtx=null;

function clone(x){return JSON.parse(JSON.stringify(x))}
function load(k,f){try{return JSON.parse(localStorage.getItem(k))??clone(f)}catch{return clone(f)}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function day0(d){const x=new Date(d);x.setHours(0,0,0,0);return x}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function dkey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function fmt(d,o={weekday:"long",month:"long",day:"numeric"}){return d.toLocaleDateString(undefined,o)}
function weekStart(d){const x=day0(d);return addDays(x,-((x.getDay()+6)%7))}
function monthStart(d){return new Date(d.getFullYear(),d.getMonth(),1)}
function monthEnd(d){return new Date(d.getFullYear(),d.getMonth()+1,0)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function byId(id){return meals.find(m=>m.id===id)}
function uid(){return `m-${Date.now()}-${Math.random().toString(36).slice(2,6)}`}

function seedPlan(){
  const b=["egg-toast","yogurt-bowl","rainbow-cups","egg-toast","yogurt-bowl","rainbow-cups","egg-toast"];
  const l=["turkey-sandwich","turkey-sandwich","chicken-rice","turkey-sandwich","chicken-salad","turkey-chili","chicken-rice"];
  const a=["chomps","apple-almond","perfect-bar","g2g","chomps","apple-almond","yogurt-bowl"];
  const z=["popcorn","edamame","popcorn","walnuts","edamame","popcorn","eggs-snack"];
  const out={},start=monthStart(new Date());
  for(let i=0;i<75;i++){const d=addDays(start,i),j=i%7;out[dkey(d)]={"Breakfast":b[j],"Snack 1":a[j],"Lunch":l[j],"Snack 2":z[j]}}
  out[dkey(addDays(start,27))]["Breakfast"]="protein-oatmeal";
  return out;
}
function ensureDate(d){const k=dkey(d);if(!plan[k])plan[k]={"Breakfast":"egg-toast","Snack 1":"chomps","Lunch":"turkey-sandwich","Snack 2":"popcorn"};return plan[k]}

function setCheck(id,val){checks[id]=val;save(K.checks,checks)}
function checkRow(id,title,sub=""){
  return `<label class="row"><input type="checkbox" ${checks[id]?"checked":""} onchange="setCheck('${esc(id)}',this.checked)"><span class="row-main"><strong>${esc(title)}</strong>${sub?`<span>${esc(sub)}</span>`:""}</span></label>`
}

function renderToday(){
  const d=day0(new Date()),k=dkey(d),p=ensureDate(d);
  document.getElementById("headerDate").textContent=fmt(d);
  let h=`<div class="section-title">Meals</div>`;
  for(const s of slots){const m=byId(p[s]);h+=checkRow(`meal-${k}-${s}`,s,m?.name||"Choose meal")}
  for(const [g,items] of Object.entries(meds)){h+=`<div class="section-title">${esc(g)}</div>`;for(const x of items)h+=checkRow(`med-${k}-${g}-${x}`,x)}
  document.getElementById("todayList").innerHTML=h;
}

function range(){
  if(view==="day")return[anchor];
  if(view==="week"){const s=weekStart(anchor);return Array.from({length:7},(_,i)=>addDays(s,i))}
  const s=monthStart(anchor),e=monthEnd(anchor);return Array.from({length:e.getDate()},(_,i)=>addDays(s,i))
}
function slotButton(d,s){const m=byId(ensureDate(d)[s]);return `<button class="slot" onclick="openSwap('${dkey(d)}','${s}')"><small>${s}</small>${esc(m?.name||"Choose meal")}</button>`}
function dayCard(d){const t=dkey(d)===dkey(new Date());return `<article id="day-${dkey(d)}" class="day-card ${t?"today":""}"><header><span>${fmt(d,{weekday:"short",month:"short",day:"numeric"})}</span>${t?'<span class="badge">Today</span>':""}</header>${slots.map(s=>slotButton(d,s)).join("")}</article>`}
function renderPlanner(){
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const cls=view==="week"?"week-grid":view==="month"?"month-grid":"";
  document.getElementById("planner").innerHTML=`<div class="planner-grid ${cls}">${range().map(dayCard).join("")}</div>`;
  renderShopping();
}

function openSwap(day,slot){swapCtx={day,slot};document.getElementById("swapLabel").textContent=`${fmt(new Date(day+"T00:00:00"))} · ${slot}`;document.getElementById("swapSearch").value="";renderSwap();document.getElementById("swapDialog").showModal()}
function renderSwap(){
  const q=document.getElementById("swapSearch").value.toLowerCase().trim(),cat=slotCat[swapCtx.slot];
  let list=meals.filter(m=>!m.archived&&m.category===cat&&(!q||m.name.toLowerCase().includes(q)||m.ingredients.join(" ").toLowerCase().includes(q)));
  list.sort((a,b)=>(b.favorite-a.favorite)||a.name.localeCompare(b.name));
  document.getElementById("swapOptions").innerHTML=list.length?list.map(m=>`<button type="button" class="row" onclick="chooseSwap('${m.id}')"><span class="row-main"><strong>${m.favorite?"★ ":""}${esc(m.name)}</strong><span>${esc(m.ingredients.slice(0,3).join(", "))}</span></span></button>`).join(""):'<div class="empty">No matches</div>';
}
function chooseSwap(id){ensureDate(new Date(swapCtx.day+"T00:00:00"))[swapCtx.slot]=id;save(K.plan,plan);document.getElementById("swapDialog").close();renderPlanner();renderToday()}

function renderFilters(){document.getElementById("mealFilters").innerHTML=categories.map(c=>`<button class="chip ${c===filter?"active":""}" onclick="setFilter('${c}')">${c}</button>`).join("")}
function setFilter(c){filter=c;renderFilters();renderLibrary()}
function visibleMeals(){
  const q=document.getElementById("mealSearch").value.toLowerCase().trim();
  return meals.filter(m=>{
    const qok=!q||m.name.toLowerCase().includes(q)||m.ingredients.join(" ").toLowerCase().includes(q);
    const fok=filter==="All"?!m.archived:filter==="Favorites"?!m.archived&&m.favorite:filter==="Archived"?m.archived:!m.archived&&m.category===filter;
    return qok&&fok;
  }).sort((a,b)=>(b.favorite-a.favorite)||a.name.localeCompare(b.name))
}
function renderLibrary(){
  const list=visibleMeals();
  document.getElementById("mealLibrary").innerHTML=list.length?list.map(m=>`<div class="row"><span class="row-main"><strong>${m.favorite?"★ ":""}${esc(m.name)}</strong><span>${esc(m.category)} · ${esc(m.ingredients.slice(0,3).join(", "))}</span></span><span class="row-actions"><button onclick="openMeal('${m.id}')">Edit</button></span></div>`).join(""):'<div class="empty">No meals found</div>';
}
function openMeal(id=null){
  editing=id;const m=id?byId(id):{name:"",category:"Breakfast",ingredients:[],notes:"",favorite:false,archived:false};
  document.getElementById("mealDialogTitle").textContent=id?"Edit meal":"Add meal";
  document.getElementById("mealName").value=m.name;document.getElementById("mealCategory").value=m.category;document.getElementById("mealIngredients").value=m.ingredients.join("\n");document.getElementById("mealNotes").value=m.notes||"";document.getElementById("mealFavorite").checked=!!m.favorite;
  document.getElementById("duplicateMeal").classList.toggle("hidden",!id);document.getElementById("archiveMeal").classList.toggle("hidden",!id);
  document.getElementById("archiveMeal").textContent=m.archived?"Restore":"Archive";
  document.getElementById("mealDialog").showModal()
}
function closeMeal(){document.getElementById("mealDialog").close();editing=null}
function saveMeal(e){
  e.preventDefault();const data={name:document.getElementById("mealName").value.trim(),category:document.getElementById("mealCategory").value,ingredients:document.getElementById("mealIngredients").value.split("\n").map(x=>x.trim()).filter(Boolean),notes:document.getElementById("mealNotes").value.trim(),favorite:document.getElementById("mealFavorite").checked};
  if(editing)Object.assign(byId(editing),data);else meals.push({id:uid(),...data,archived:false});
  save(K.meals,meals);closeMeal();renderLibrary();renderPlanner();renderToday()
}
function duplicateCurrent(){
  if(!editing)return;const m=byId(editing);meals.push({...clone(m),id:uid(),name:`${m.name} Copy`,archived:false});save(K.meals,meals);closeMeal();renderLibrary()
}
function toggleArchive(){if(!editing)return;const m=byId(editing);m.archived=!m.archived;save(K.meals,meals);closeMeal();renderLibrary()}

function renderShopping(){
  const counts={};
  for(const d of range()){const p=ensureDate(d);for(const s of slots){const m=byId(p[s]);if(!m)continue;for(const i of m.ingredients)counts[i]=(counts[i]||0)+1}}
  const items=Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0]));
  document.getElementById("shoppingList").innerHTML=items.length?items.map(([name,n])=>{const id=`shop-${name}`;return `<label class="row"><input type="checkbox" ${shopChecks[id]?"checked":""} onchange="shopChecks['${esc(id)}']=this.checked;save(K.shop,shopChecks)"><span class="row-main"><strong>${esc(name)}</strong>${n>1?`<span>Used in ${n} planned meals</span>`:""}</span></label>`}).join(""):'<div class="empty">No ingredients planned</div>'
}
function renderPrep(){document.getElementById("prepList").innerHTML=prepItems.map((x,i)=>checkRow(`prep-${i}`,x)).join("")}

document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav-btn,.screen").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.screen).classList.add("active")}));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;localStorage.setItem(K.view,view);renderPlanner()}));
document.getElementById("jumpToday").onclick=()=>{anchor=day0(new Date());renderPlanner();requestAnimationFrame(()=>document.getElementById(`day-${dkey(new Date())}`)?.scrollIntoView({behavior:"smooth",block:"center"}))};
document.getElementById("mealSearch").oninput=renderLibrary;document.getElementById("swapSearch").oninput=renderSwap;
document.getElementById("addMeal").onclick=()=>openMeal();document.getElementById("closeMeal").onclick=closeMeal;document.getElementById("mealForm").onsubmit=saveMeal;document.getElementById("duplicateMeal").onclick=duplicateCurrent;document.getElementById("archiveMeal").onclick=toggleArchive;
document.getElementById("clearShop").onclick=()=>{shopChecks={};save(K.shop,shopChecks);renderShopping()};
document.getElementById("resetToday").onclick=()=>{const t=dkey(new Date());if(confirm("Clear today's checks?")){Object.keys(checks).filter(k=>k.includes(t)).forEach(k=>delete checks[k]);save(K.checks,checks);renderToday()}};

window.setCheck=setCheck;window.openSwap=openSwap;window.chooseSwap=chooseSwap;window.setFilter=setFilter;window.openMeal=openMeal;window.shopChecks=shopChecks;window.save=save;window.K=K;

renderToday();renderFilters();renderLibrary();renderPlanner();renderPrep();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
