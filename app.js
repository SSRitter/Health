const exclusions=["Seafood/Fish","Raw onion","Avocados","Mushrooms","Pistachios","Spaghetti squash","Seed oils"];
const goals={water:100,protein:130,fiber:35};

const meals={
  eggToast:{text:"3 eggs + whole-grain/sourdough toast + berries",protein:24,fiber:6},
  yogurt:{text:"Greek yogurt + berries + granola + chia seeds",protein:28,fiber:10},
  eggCups:{text:"Rainbow egg cups + berries",protein:24,fiber:4},
  oatmeal:{text:"Protein oatmeal + blueberries + chia seeds + almond butter",protein:35,fiber:13},
  turkeySandwich:{text:"Turkey sandwich + carrots + apple",protein:35,fiber:10},
  chickenBowl:{text:"Chicken rice bowl with broccoli + peppers",protein:45,fiber:8},
  salad:{text:"Big chicken salad + walnuts",protein:42,fiber:7},
  chili:{text:"Turkey chili + rice",protein:40,fiber:10}
};

const snackMacros={
  "Chomps":{protein:10,fiber:0},
  "Perfect Bar":{protein:17,fiber:3},
  "G2G Bar":{protein:18,fiber:4},
  "Dry roasted edamame":{protein:14,fiber:6},
  "Apple + almond butter":{protein:7,fiber:7},
  "Clean avocado-oil popcorn":{protein:3,fiber:4},
  "Walnuts":{protein:4,fiber:2},
  "Greek yogurt":{protein:18,fiber:0},
  "Hard-boiled eggs":{protein:12,fiber:0}
};

const pattern=[
{b:meals.eggToast,l:meals.turkeySandwich,s1:"Chomps",s2:"Clean avocado-oil popcorn"},
{b:meals.yogurt,l:meals.turkeySandwich,s1:"Apple + almond butter",s2:"Dry roasted edamame"},
{b:meals.eggCups,l:meals.chickenBowl,s1:"Perfect Bar",s2:"Clean avocado-oil popcorn"},
{b:meals.eggToast,l:meals.turkeySandwich,s1:"G2G Bar",s2:"Walnuts"},
{b:meals.yogurt,l:meals.salad,s1:"Chomps",s2:"Dry roasted edamame"},
{b:meals.eggCups,l:meals.chili,s1:"Apple + almond butter",s2:"Clean avocado-oil popcorn"},
{b:meals.eggToast,l:meals.chickenBowl,s1:"Greek yogurt",s2:"Hard-boiled eggs"}];

const plan=Array.from({length:30},(_,i)=>({day:i+1,...pattern[i%7]})); plan[27].b=meals.oatmeal;

const favorites={"Breakfasts":["Eggs + toast + berries","Greek yogurt + berries + granola + chia seeds","Rainbow egg cups","Protein oatmeal, about once per month"],"Snacks":["Chomps","Perfect Bar","G2G Bar","Dry roasted edamame","Apple + almond butter","Clean avocado-oil/no-seed-oil popcorn","Hard-boiled eggs","Greek yogurt","Walnuts"],"Avoid":exclusions};
const meds={"Breakfast":["Creatine","Vitamin D/K2","Amlodipine","Duloxetine","Pravastatin"],"Lunch":["Mesalamine"],"Evening":["Magnesium glycinate","Cortisol Manager"],"Before bed":["Melatonin"]};
const shopping={"Protein":["Eggs: about 5 dozen/month","Chicken breast: 12–14 lb/month","Turkey breast slices: 4–5 lb/month","Lean ground turkey: 6–8 lb/month","Greek yogurt","Chomps","Perfect Bars","G2G Bars","Dry roasted edamame"],"Produce":["Blueberries","Strawberries","Apples","Romaine","Spinach","Broccoli","Bell peppers","Tomatoes","Cucumbers","Carrots","Celery","Garlic","Lemons"],"Carbs":["Whole-grain or sourdough bread","Granola","Old-fashioned oats","Brown rice","Potatoes if desired"],"Fats + Pantry":["Almond butter","Walnuts","Chia seeds","Flaxseed","Olive oil","Avocado oil","Avocado-oil mayonnaise","Mustard","Balsamic vinegar","Marinara","Clean avocado-oil/no-seed-oil popcorn","Salt, pepper, garlic powder, cinnamon"],"Supplements/Medication":["Creatine","Vitamin D/K2","Amlodipine","Duloxetine","Pravastatin","Mesalamine","Magnesium glycinate","Cortisol Manager","Melatonin"]};
const prep=["Make 18–24 rainbow egg cups.","Hard boil 12 eggs.","Cook 3–4 lb chicken breast.","Brown 2 lb lean ground turkey for chili/bowls.","Cook a large batch of brown rice.","Wash/chop romaine, carrots, celery, peppers, cucumbers.","Portion Chomps/bars, popcorn, walnuts, and edamame.","Set out breakfast, lunch, evening, and bedtime meds/supplements."];

function todayNumber(){return((new Date()).getDate()-1)%30+1}
function key(day,item){return`hm-day-${day}-${item}`} function checked(day,item){return localStorage.getItem(key(day,item))==="1"} function setChecked(day,item,val){localStorage.setItem(key(day,item),val?"1":"0")}
function waterKey(day){return`water-${day}`} function getWater(day){return Number(localStorage.getItem(waterKey(day))||0)} function setWater(day,oz){localStorage.setItem(waterKey(day),Math.max(0,oz));renderToday()}
function medKey(day,group,item){return`med-${day}-${group}-${item}`} function medChecked(day,group,item){return localStorage.getItem(medKey(day,group,item))==="1"} function setMed(day,group,item,val){localStorage.setItem(medKey(day,group,item),val?"1":"0");renderToday()}
function manualKey(day,type){return`manual-${type}-${day}`} function getManual(day,type){return Number(localStorage.getItem(manualKey(day,type))||0)} function setManual(day,type,val){localStorage.setItem(manualKey(day,type),Math.max(0,val));renderToday()}

function snackMacro(text){return snackMacros[text]||{protein:0,fiber:0}}
function dailyMacros(d){
  const baseProtein=d.b.protein+d.l.protein+snackMacro(d.s1).protein+snackMacro(d.s2).protein;
  const baseFiber=d.b.fiber+d.l.fiber+snackMacro(d.s1).fiber+snackMacro(d.s2).fiber;
  return {
    protein:baseProtein+getManual(d.day,"protein"),
    fiber:baseFiber+getManual(d.day,"fiber"),
    baseProtein,baseFiber
  };
}

function mealBlock(day,label,text,item,macro){
  const macroText=macro?`<div class="macro-line">Est. ${macro.protein}g protein • ${macro.fiber}g fiber</div>`:"";
  return`<div class="meal"><label><input type="checkbox" ${checked(day,item)?"checked":""} onchange="setChecked(${day},'${item}',this.checked);renderToday();"><div><strong>${label}</strong><span>${text}</span>${macroText}</div></label></div>`
}
function dayCard(d){return`<div class="day"><h3>Day ${d.day}</h3>${mealBlock(d.day,"Breakfast",d.b.text,"b",d.b)}${mealBlock(d.day,"Lunch",d.l.text,"l",d.l)}${mealBlock(d.day,"Snack 1",d.s1,"s1",snackMacro(d.s1))}${mealBlock(d.day,"Snack 2",d.s2,"s2",snackMacro(d.s2))}</div>`}
function renderCalendar(){document.getElementById("calendar").innerHTML=plan.map(dayCard).join("")}
function renderList(id,obj){document.getElementById(id).innerHTML=Object.entries(obj).map(([section,items])=>`<div class="shop-section ${section==="Avoid"?"warning":""}"><h3>${section}</h3><ul>${items.map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("")}
function renderPrep(){document.getElementById("prepList").innerHTML=`<ul>${prep.map((x,i)=>`<li><label><input type="checkbox" ${localStorage.getItem("prep"+i)==="1"?"checked":""} onchange="localStorage.setItem('prep${i}',this.checked?'1':'0')"> ${x}</label></li>`).join("")}</ul>`}
function medsBlock(day){return Object.entries(meds).map(([group,items])=>`<div class="shop-section"><h3>${group}</h3>${items.map(item=>`<div class="checkrow"><label><input type="checkbox" ${medChecked(day,group,item)?"checked":""} onchange="setMed(${day},'${group}','${item}',this.checked)"> <div><strong>${item}</strong><span>${group}</span></div></label></div>`).join("")}</div>`).join("")}
function metricCard(title,value,goal,label,buttons){
  return `<div class="metric"><h3>${title}</h3><div class="progress"><div class="bar" style="width:${Math.min(value/goal*100,100)}%"></div></div><div class="muted">${value}/${goal} ${label}</div>${buttons||""}</div>`;
}
function renderToday(){
  const d=plan[todayNumber()-1];
  const mealDone=["b","l","s1","s2"].filter(i=>checked(d.day,i)).length;
  const totalMeds=Object.values(meds).flat().length;
  const doneMeds=Object.entries(meds).flatMap(([g,items])=>items.map(i=>medChecked(d.day,g,i))).filter(Boolean).length;
  const water=getWater(d.day);
  const macros=dailyMacros(d);
  const proteinBtns=`<div class="macro-buttons"><button class="small" onclick="setManual(${d.day},'protein',getManual(${d.day},'protein')+10)">+10g</button><button class="small" onclick="setManual(${d.day},'protein',getManual(${d.day},'protein')-10)">-10g</button><button class="small" onclick="setManual(${d.day},'protein',0)">Reset</button></div>`;
  const fiberBtns=`<div class="macro-buttons"><button class="small" onclick="setManual(${d.day},'fiber',getManual(${d.day},'fiber')+5)">+5g</button><button class="small" onclick="setManual(${d.day},'fiber',getManual(${d.day},'fiber')-5)">-5g</button><button class="small" onclick="setManual(${d.day},'fiber',0)">Reset</button></div>`;
  const waterBtns=`<div class="water-buttons"><button class="small" onclick="setWater(${d.day},getWater(${d.day})+8)">+8</button><button class="small" onclick="setWater(${d.day},getWater(${d.day})+16)">+16</button><button class="small" onclick="setWater(${d.day},getWater(${d.day})+24)">+24</button><button class="small" onclick="setWater(${d.day},0)">Reset</button></div>`;
  document.getElementById("todayCard").innerHTML=
  `<div class="metrics">
    ${metricCard("Protein",macros.protein,goals.protein,"g",proteinBtns)}
    ${metricCard("Fiber",macros.fiber,goals.fiber,"g",fiberBtns)}
    ${metricCard("Water",water,goals.water,"oz",waterBtns)}
    ${metricCard("Meals",mealDone,4,"checked")}
    ${metricCard("Meds/Supplements",doneMeds,totalMeds,"checked")}
  </div>
  <p class="note">Protein/fiber are rough estimates from planned meals. Use +/− buttons if you add extras.</p>
  <h3>Day ${d.day} Meals</h3>
  ${mealBlock(d.day,"Breakfast",d.b.text,"b",d.b)}
  ${mealBlock(d.day,"Lunch",d.l.text,"l",d.l)}
  ${mealBlock(d.day,"Snack 1",d.s1,"s1",snackMacro(d.s1))}
  ${mealBlock(d.day,"Snack 2",d.s2,"s2",snackMacro(d.s2))}
  <h3>Meds / Supplements</h3><div class="shopping">${medsBlock(d.day)}</div>
  <h3>Notes</h3><textarea placeholder="Optional notes..." oninput="localStorage.setItem('notes-${d.day}',this.value)">${localStorage.getItem('notes-'+d.day)||""}</textarea>`;
}
document.querySelectorAll(".tab").forEach(btn=>{btn.addEventListener("click",()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.getElementById(btn.dataset.tab).classList.add("active")})});
document.getElementById("resetBtn").onclick=()=>{const d=todayNumber();if(confirm("Clear today's checkmarks, water, meds/supplements, macros, and notes?")){Object.keys(localStorage).filter(k=>k.includes(`-${d}-`)||k===waterKey(d)||k===`notes-${d}`||k.startsWith(`hm-day-${d}-`)).forEach(k=>localStorage.removeItem(k));renderCalendar();renderToday()}};
renderCalendar();renderList("shoppingList",shopping);renderList("favoritesList",favorites);renderPrep();renderToday();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");