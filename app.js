const exclusions = ["Seafood/Fish","Raw onion","Avocados","Mushrooms","Pistachios","Spaghetti squash","Seed oils"];

const pattern = [
  {b:"3 eggs + whole-grain toast + blueberries", l:"Turkey sandwich + carrots + apple", s1:"Apple + almond butter", s2:"Clean avocado-oil popcorn"},
  {b:"3 eggs + whole-grain toast + blueberries", l:"Turkey sandwich + carrots + apple", s1:"Apple + almond butter", s2:"Dairy-free yogurt + chia"},
  {b:"Protein oatmeal + blueberries + chia", l:"Chicken rice bowl with broccoli + peppers", s1:"Hard-boiled eggs", s2:"Clean avocado-oil popcorn"},
  {b:"3 eggs + whole-grain toast + blueberries", l:"Turkey sandwich + carrots + apple", s1:"Apple + almond butter", s2:"Walnuts"},
  {b:"Protein oatmeal + blueberries + chia", l:"Big chicken salad + walnuts", s1:"Protein shake", s2:"Clean avocado-oil popcorn"},
  {b:"Rainbow egg cups + berries", l:"Turkey chili + rice", s1:"Celery + almond butter", s2:"Roasted edamame"},
  {b:"Rainbow egg cups + berries", l:"Chicken bowl leftovers", s1:"Dairy-free yogurt", s2:"Hard-boiled eggs"}
];

const plan = Array.from({length:30}, (_,i)=> ({day:i+1, ...pattern[i%7]}));

const shopping = {
  "Protein": ["Eggs: about 5 dozen/month","Chicken breast: 12–14 lb/month","Turkey breast slices: 4–5 lb/month","Lean ground turkey: 6–8 lb/month","Protein powder","Dairy-free yogurt","Roasted edamame"],
  "Produce": ["Blueberries","Apples","Bananas if desired","Romaine","Spinach","Broccoli","Bell peppers","Tomatoes","Cucumbers","Carrots","Celery","Garlic","Lemons"],
  "Carbs": ["Whole-grain or sourdough bread","Old-fashioned oats","Brown rice","Potatoes if desired"],
  "Fats + Pantry": ["Almond butter","Walnuts","Chia seeds","Flaxseed","Olive oil","Avocado oil","Avocado-oil mayonnaise","Mustard","Balsamic vinegar","Marinara","Clean avocado-oil/no-seed-oil popcorn","Salt, pepper, garlic powder, cinnamon"]
};

const prep = [
  "Cook 3–4 lb chicken breast.",
  "Brown 2 lb lean ground turkey for chili/bowls.",
  "Cook a large batch of brown rice.",
  "Make 18–24 rainbow egg cups.",
  "Hard boil 12 eggs.",
  "Wash/chop romaine, carrots, celery, peppers, cucumbers.",
  "Portion popcorn, walnuts, and apple/almond-butter snack packs.",
  "Set out supplements for the week."
];

function key(day, item){ return `hm-day-${day}-${item}`; }
function checked(day,item){ return localStorage.getItem(key(day,item)) === "1"; }
function setChecked(day,item,val){ localStorage.setItem(key(day,item), val ? "1" : "0"); }

function mealBlock(day, label, text, item){
  return `<div class="meal"><label><input type="checkbox" ${checked(day,item)?"checked":""} onchange="setChecked(${day},'${item}',this.checked); renderToday();"><div><strong>${label}</strong><span>${text}</span></div></label></div>`;
}

function dayCard(d){
  return `<div class="day"><h3>Day ${d.day}</h3>
    ${mealBlock(d.day,"Breakfast",d.b,"b")}
    ${mealBlock(d.day,"Lunch",d.l,"l")}
    ${mealBlock(d.day,"Snack 1",d.s1,"s1")}
    ${mealBlock(d.day,"Snack 2",d.s2,"s2")}
  </div>`;
}

function renderCalendar(){ document.getElementById("calendar").innerHTML = plan.map(dayCard).join(""); }

function renderShopping(){
  document.getElementById("shoppingList").innerHTML = Object.entries(shopping).map(([section,items]) =>
    `<div class="shop-section"><h3>${section}</h3><ul>${items.map(x=>`<li>${x}</li>`).join("")}</ul></div>`
  ).join("");
}

function renderPrep(){
  document.getElementById("prepList").innerHTML =
    `<ul>${prep.map((x,i)=>`<li><label><input type="checkbox" ${localStorage.getItem("prep"+i)==="1"?"checked":""} onchange="localStorage.setItem('prep${i}',this.checked?'1':'0')"> ${x}</label></li>`).join("")}</ul>
     <h3>Foods avoided</h3><p>${exclusions.join(" • ")}</p>`;
}

function renderToday(){
  const todayIndex = ((new Date()).getDate()-1) % 30;
  const d = plan[todayIndex];
  const done = ["b","l","s1","s2"].filter(i=>checked(d.day,i)).length;
  document.getElementById("todayCard").innerHTML =
    `<h3>Day ${d.day}</h3><div class="progress"><div class="bar" style="width:${done/4*100}%"></div></div>
     ${mealBlock(d.day,"Breakfast",d.b,"b")}
     ${mealBlock(d.day,"Lunch",d.l,"l")}
     ${mealBlock(d.day,"Snack 1",d.s1,"s1")}
     ${mealBlock(d.day,"Snack 2",d.s2,"s2")}
     <h3>Notes</h3><textarea placeholder="Energy, digestion, sleep, symptoms..." oninput="localStorage.setItem('notes-${d.day}',this.value)">${localStorage.getItem('notes-'+d.day)||""}</textarea>`;
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
document.getElementById("resetBtn").onclick = () => {
  if(confirm("Clear checkmarks and notes?")){
    Object.keys(localStorage).filter(k=>k.startsWith("hm-")||k.startsWith("notes-")||k.startsWith("prep")).forEach(k=>localStorage.removeItem(k));
    renderCalendar(); renderToday(); renderPrep();
  }
};

renderCalendar(); renderShopping(); renderPrep(); renderToday();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
