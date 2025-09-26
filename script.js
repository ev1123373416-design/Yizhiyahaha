const stages = ["取货","退货","退款","完成"];
let deliveryCount = 0;
let deliveries = [];
let archiveList = [];

function getDatePrefix(){
  const days=["日","一","二","三","四","五","六"];
  const d=new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")} ${days[d.getDay()]}`;
}

function saveToStorage(){
  localStorage.setItem("deliveries",JSON.stringify(deliveries));
  localStorage.setItem("archiveList",JSON.stringify(archiveList));
}

function loadFromStorage(){
  const data = localStorage.getItem("deliveries");
  if(data){ deliveries=JSON.parse(data); deliveryCount=deliveries.length; deliveries.forEach(d=>renderDelivery(d)); }
  const arch = localStorage.getItem("archiveList");
  if(arch){ archiveList=JSON.parse(arch); renderArchive(); }
}

const stagePositions = [9.5, 36.5, 63.5, 90.5];

function renderDelivery(delivery){
  const list = document.getElementById("delivery-list");
  const div = document.createElement("div");
  div.className = "delivery";
  div.dataset.stage = delivery.stage;
  div.dataset.id = delivery.id;
  if(delivery.stage === stages.length - 1) div.classList.add("finished");

  div.innerHTML = `
    <div class="delivery-header">
      <div class="title" onclick="editTitle(this)">${delivery.name}</div>
      <div class="actions">
        <button onclick="prevStage(this)">上一步</button>
        <button onclick="nextStage(this)">${delivery.stage === stages.length-1 ? "归档" : "下一步"}</button>
      </div>
    </div>
    <div class="progress-container">
      <div class="progress-track">
        <div class="progress-bar"></div>
        <div class="stages">
          ${stages.map((s, i) => `<div class="stage" style="left:${stagePositions[i]}%">${s}</div>`).join("")}
        </div>
      </div>
    </div>
  `;
  list.appendChild(div);
  updateProgress(div, delivery.stage);
}

function renderArchive(){
  const list = document.getElementById("archive-list");
  list.innerHTML="";
  archiveList.forEach(d=>{
    const div=document.createElement("div");
    div.className="delivery finished";
    div.innerHTML=`<div class="title">${d.name}（已归档）</div>`;
    list.appendChild(div);
  });
}

function addDelivery(){
  const input=document.getElementById("delivery-name");
  let name=input.value.trim(); input.value="";
  deliveryCount++;
  if(!name) name=`任务 ${deliveryCount}`;
  const fullName=`${getDatePrefix()} ${name}`;
  const delivery={id:Date.now()+Math.random(), name:fullName, stage:0};
  deliveries.push(delivery); saveToStorage(); renderDelivery(delivery);
}

function updateProgress(card, stage){
  const bar = card.querySelector(".progress-bar");
  const progressPercent = stagePositions[stage];
  bar.style.width = `${progressPercent}%`;
  const stageEls = card.querySelectorAll(".stage");
  stageEls.forEach((el, i) => el.classList.toggle("active", i <= stage));
}

function nextStage(btn){
  const card=btn.closest(".delivery");
  const id=card.dataset.id;
  const index=deliveries.findIndex(d=>d.id==id);
  if(deliveries[index].stage>=stages.length-1){
    archiveTask(index);
    return;
  }
  deliveries[index].stage++;
  updateProgress(card,deliveries[index].stage);
  if(deliveries[index].stage===stages.length-1){
    card.querySelector("button:last-child").textContent="归档";
    card.classList.add("finished");
  }
  saveToStorage();
}

function prevStage(btn){
  const card=btn.closest(".delivery");
  const id=card.dataset.id;
  const index=deliveries.findIndex(d=>d.id==id);
  if(deliveries[index].stage<=0) return;
  deliveries[index].stage--;
  updateProgress(card,deliveries[index].stage);
  card.querySelector("button:last-child").textContent="下一步";
  card.classList.remove("finished");
  saveToStorage();
}

function archiveTask(index){
  archiveList.unshift(deliveries[index]);
  deliveries.splice(index,1);
  document.getElementById("delivery-list").innerHTML="";
  deliveries.forEach(renderDelivery);
  renderArchive();
  saveToStorage();
}

function editTitle(titleEl){
  const card=titleEl.closest(".delivery");
  const id=card.dataset.id;
  const index=deliveries.findIndex(d=>d.id==id);
  const oldName=deliveries[index].name;
  const input=document.createElement("input"); input.type="text"; input.value=oldName;
  titleEl.innerHTML=""; titleEl.appendChild(input); input.focus();
  function save(){ let val=input.value.trim(); if(!val) val=oldName; deliveries[index].name=val; titleEl.textContent=val; saveToStorage(); }
  input.addEventListener("blur",save);
  input.addEventListener("keydown",(e)=>{ if(e.key==="Enter") input.blur(); });
}

function toggleArchive(){
  const list = document.getElementById("archive-list");
  list.style.display = list.style.display==="none"?"block":"none";
}

document.getElementById("delivery-name").addEventListener("keydown",e=>{ if(e.key==="Enter") addDelivery(); });

loadFromStorage();