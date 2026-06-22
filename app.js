const communications = [
  {id:1,campaign:"Year 6 Parent Evening 2026",type:"Message",audiences:["Year 6","Year 7","Class 8A","Class 8B","Parent Committee","Boarding Parents","New Joiners","Learning Support"],channels:["Email","Push","SMS"],status:"Sent",deliveredAt:"20 Jun 2026 · 10:42 AM",sender:"A. Khan",approver:"Sarah Mitchell",category:"Reminder",language:"English",rejection:"",content:"A reminder that Year 6 parent evening takes place tomorrow from 4:00–7:00 PM. Please use your booking link to confirm your slot.",analytics:{intended:"1,000",delivered:"950",opened:"682",failed:"50",pushOpened:"418",emailOpened:"64%"}},
  {id:2,campaign:"Uniform Policy – Autumn Term",type:"Notice",audiences:["Whole school"],channels:["Email","Push"],status:"Sent",deliveredAt:"19 Jun 2026 · 02:15 PM",sender:"Principal's Office",approver:"David Clarke",category:"Policy",language:"English",rejection:"",content:"Please review the updated uniform policy, effective from the start of the next term.",analytics:{intended:"1,842",delivered:"1,842",opened:"1,326",failed:"0",pushOpened:"790",emailOpened:"72%"}},
  {id:3,campaign:"Term 2 Activities Programme",type:"Circular",audiences:["Year 4","Year 5","Year 6","Year 7","Year 8","Boarders","Day Students"],channels:["Email","WhatsApp"],status:"Sent",deliveredAt:"18 Jun 2026 · 09:00 AM",sender:"Activities Office",approver:"Sarah Mitchell",category:"Activities",language:"English",rejection:"",content:"Term 2 clubs, trips and activity dates are now available.",analytics:{intended:"2,116",delivered:"2,116",opened:"1,714",failed:"0",pushOpened:"—",emailOpened:"81%"}},
  {id:4,campaign:"Year 9 Fee Instalment Reminder",type:"Message",audiences:["Year 9 Guardians","Overdue Accounts","International Families"],channels:["Email","SMS"],status:"Pending approval",deliveredAt:"Not delivered",sender:"Finance Team",approver:"Michael Brown",category:"Reminder",language:"English",rejection:"",content:"This is a friendly reminder that the next fee instalment is due.",analytics:{intended:"420",delivered:"0",opened:"0",failed:"0",pushOpened:"—",emailOpened:"—"}},
  {id:5,campaign:"Annual Sports Day – Final Reminder",type:"Message",audiences:["Whole school","Year 6","Year 7","Year 8","Year 9","Year 10","Year 11","Staff"],channels:["Push","SMS","WhatsApp"],status:"Scheduled",deliveredAt:"23 Jun 2026 · 08:00 AM",sender:"Sports Department",approver:"Sarah Mitchell",category:"Reminder",language:"English",rejection:"",content:"Sports Day begins at 9:00 AM. Students should arrive in their house colours.",analytics:{intended:"1,842",delivered:"0",opened:"0",failed:"0",pushOpened:"—",emailOpened:"—"}},
  {id:6,campaign:"Transport Route Changes – Week 9",type:"Notice",audiences:["Bus Route 4","Bus Route 7","Transport Coordinators"],channels:["Push","SMS"],status:"Rejected",deliveredAt:"Not delivered",sender:"Transport Team",approver:"Sarah Mitchell",category:"Notice",language:"English",rejection:"Please confirm the effective date and include the emergency contact number.",content:"Updated transport arrangements will apply next week.",analytics:{intended:"186",delivered:"0",opened:"0",failed:"0",pushOpened:"—",emailOpened:"—"}}
];

let state={summary:"all",filters:{},search:"",selected:null,detailTab:"content",contentLanguage:"English",contentChannel:"Email"};
let composeState={step:1,activeChannel:"Email",variants:{},languages:["English"],aiPreviewChannel:"Email"};
const languageGroups={
  "Popular":["English","French","Spanish","German","Arabic","Mandarin Chinese","Hindi","Portuguese"],
  "Europe":["Albanian","Basque","Belarusian","Bosnian","Bulgarian","Catalan","Croatian","Czech","Danish","Dutch","Estonian","Finnish","French","German","Greek","Hungarian","Icelandic","Irish","Italian","Latvian","Lithuanian","Macedonian","Maltese","Norwegian","Polish","Portuguese","Romanian","Russian","Serbian","Slovak","Slovenian","Spanish","Swedish","Turkish","Ukrainian","Welsh"],
  "South & Southeast Asia":["Assamese","Bengali","Burmese","Cebuano","Filipino","Gujarati","Hindi","Indonesian","Kannada","Khmer","Lao","Malay","Malayalam","Marathi","Nepali","Odia","Punjabi","Sinhala","Tamil","Telugu","Thai","Urdu","Vietnamese"],
  "Middle East":["Arabic","Armenian","Azerbaijani","Dari","Georgian","Hebrew","Kurdish (Kurmanji)","Kurdish (Sorani)","Pashto","Persian","Turkish","Urdu"]
};
const magicMarkers=[
  {name:"Parent name",token:"{{Parent Name}}",description:"Primary guardian's display name"},
  {name:"Student name",token:"{{Student Name}}",description:"Student's full name"},
  {name:"Student first name",token:"{{Student First Name}}",description:"Student's first name"},
  {name:"Class",token:"{{Class Name}}",description:"Current class or form"},
  {name:"Year / grade",token:"{{Year Group}}",description:"Current year or grade"},
  {name:"School name",token:"{{School Name}}",description:"School display name"},
  {name:"Staff sender",token:"{{Sender Name}}",description:"Name of the communication sender"},
  {name:"Booking link",token:"{{Booking Link}}",description:"Recipient-specific booking URL"},
  {name:"Payment link",token:"{{Payment Link}}",description:"Recipient-specific payment URL"},
  {name:"Outstanding amount",token:"{{Outstanding Amount}}",description:"Current outstanding balance"}
];
const rows=document.querySelector("#communicationRows"), listTitle=document.querySelector("#listTitle");
const scrim=document.querySelector("#scrim"), filterDrawer=document.querySelector("#filterDrawer"), detailsDrawer=document.querySelector("#detailsDrawer");
const communicationsPage=document.querySelector("#communicationsPage"), composePage=document.querySelector("#composePage"), modulePage=document.querySelector("#modulePage");
const sidebar=document.querySelector(".sidebar"),mobileNavScrim=document.querySelector("#mobileNavScrim");

function slug(value){return value.toLowerCase().replaceAll(" ","-")}
function filtered(){
  return communications.filter(c=>{
    if(state.summary!=="all" && c.status!==state.summary) return false;
    const q=state.search.toLowerCase();
    if(q && ![c.campaign,c.type,c.audiences.join(" "),c.channels.join(" "),c.status,c.category].join(" ").toLowerCase().includes(q)) return false;
    for(const [key,value] of Object.entries(state.filters)){
      if(!value) continue;
      if(key==="type" && c.type!==value)return false;
      if(key==="status" && c.status!==value)return false;
      if(key==="channel" && !c.channels.includes(value))return false;
      if(key==="audience" && !c.audiences.some(a=>a.includes(value)))return false;
      if(key==="sender" && value!=="Me" && c.sender!==value)return false;
      if(key==="category" && c.category!==value)return false;
      if(key==="language" && c.language!==value)return false;
    }
    return true;
  });
}

function audienceHTML(c){
  const visible=c.audiences.slice(0,2).join(", ");
  return c.audiences.length>2 ? `${visible}, <button class="audience-more" data-view="${c.id}" data-tab="audience">… +${c.audiences.length-2}</button>` : visible;
}
function deliveryDateHTML(value){
  if(value==="Not delivered") return `<span class="date-cell">Not delivered</span>`;
  const [date,time]=value.split(" · ");
  return `<span class="date-cell">${date}<small>${time||""}</small></span>`;
}
function render(){
  const data=filtered();
  rows.innerHTML=data.map(c=>`<tr data-view="${c.id}">
    <td class="subject">${c.campaign}</td><td>${c.type}</td><td>${audienceHTML(c)}</td>
    <td>${c.channels.join(" / ")}</td><td><span class="status ${slug(c.status)}">${c.status}</span></td>
    <td>${deliveryDateHTML(c.deliveredAt)}</td>
    <td><button class="more-button" data-menu="${c.id}" aria-label="Actions for ${c.campaign}">…</button></td></tr>`).join("");
  listTitle.textContent=state.summary==="all"?"All communications":state.summary;
  document.querySelector("#resultCount").textContent=`${data.length ? "1–"+data.length : "0"} of ${data.length}`;
}

function closeDrawers(){
  filterDrawer.classList.remove("open"); detailsDrawer.classList.remove("open"); scrim.classList.add("hidden");
  filterDrawer.setAttribute("aria-hidden","true"); detailsDrawer.setAttribute("aria-hidden","true");
}
function openDrawer(drawer){closeMenus();closeDrawers();drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");scrim.classList.remove("hidden")}
function closeMenus(){document.querySelectorAll(".action-menu").forEach(el=>el.remove())}
function actionsFor(c){
  if(c.status==="Pending approval")return ["View","Approve","Reject"];
  if(c.status==="Scheduled")return ["View","Reschedule","Cancel"];
  if(c.status==="Rejected")return ["View","View rejection reason","Duplicate"];
  return ["View","Duplicate"];
}
function showMenu(button,id){
  closeMenus();const c=communications.find(x=>x.id===id), menu=document.createElement("div");menu.className="action-menu";
  menu.innerHTML=actionsFor(c).map(a=>`<button data-action="${a}" data-id="${id}" class="${["Reject","Cancel"].includes(a)?"danger":""}">${a}</button>`).join("");
  document.body.append(menu);const r=button.getBoundingClientRect();menu.style.left=`${Math.min(r.left-155,innerWidth-205)}px`;menu.style.top=`${r.bottom+4}px`;
}
function showDetails(id,tab="content"){
  state.selected=communications.find(c=>c.id===id);state.detailTab=tab;
  state.contentLanguage="English";state.contentChannel=state.selected.channels[0];
  const c=state.selected;document.querySelector("#detailType").textContent=c.type.toUpperCase();document.querySelector("#detailSubject").textContent=c.campaign;
  document.querySelector("#detailMeta").textContent=`Created by ${c.sender} · ${c.deliveredAt}`;
  const status=document.querySelector("#detailStatus");status.textContent=c.status;status.className=`status ${slug(c.status)}`;
  document.querySelectorAll("[data-detail-tab]").forEach(b=>b.classList.toggle("active",b.dataset.detailTab===tab));
  renderDetails();openDrawer(detailsDrawer);
}
function translatedCopy(c,language){
  if(language==="Arabic") return {
    campaign:c.campaign==="Year 6 Parent Evening 2026"?"أمسية أولياء أمور الصف السادس 2026":c.campaign,
    greeting:"عزيزي {{Parent Name}}،",
    body:"نذكّركم بأن أمسية أولياء أمور الصف السادس ستقام غداً من الساعة 4:00 حتى 7:00 مساءً. يرجى استخدام رابط الحجز لتأكيد موعدكم.",
    action:"تأكيد الحضور"
  };
  if(language==="French") return {
    campaign:c.campaign==="Year 6 Parent Evening 2026"?"Réunion des parents de Year 6 – 2026":c.campaign,
    greeting:"Cher/Chère {{Parent Name}},",
    body:"Nous vous rappelons que la réunion des parents de Year 6 aura lieu demain de 16 h à 19 h. Utilisez le lien de réservation pour confirmer votre créneau.",
    action:"Confirmer la présence"
  };
  return {campaign:c.campaign,greeting:"Dear {{Parent Name}},",body:c.content,action:"Confirm attendance"};
}
function channelPreview(c,language,channel){
  const copy=translatedCopy(c,language), dir=language==="Arabic"?"rtl":"ltr";
  if(channel==="SMS") return `<div class="device-preview sms-preview" dir="${dir}"><div class="device-label">SMS preview · ${language}</div><p>${copy.body}</p><small>Reply STOP to opt out</small></div>`;
  if(channel==="Push") return `<div class="device-preview push-preview" dir="${dir}"><div class="push-app"><span>R</span><b>Repton High School</b><small>now</small></div><h3>${copy.campaign}</h3><p>${copy.body}</p></div>`;
  if(channel==="WhatsApp") return `<div class="device-preview whatsapp-preview" dir="${dir}"><div class="device-label">WhatsApp preview · ${language}</div><h3>${copy.campaign}</h3><p>${copy.greeting}</p><p>${copy.body}</p><a href="javascript:void(0)">${copy.action}</a></div>`;
  return `<article class="campaign-preview" dir="${dir}">
      <div class="campaign-hero"><span>REPTON HIGH SCHOOL</span><h3>${copy.campaign}</h3><p>Everything families need to know, in one place.</p></div>
      <div class="campaign-copy"><small>${language.toUpperCase()} · ${language==="English"?"ORIGINAL":"AI TRANSLATION"}</small><p>${copy.greeting}</p><p>${copy.body}</p><p>We look forward to welcoming you. Please review the information and complete the action below.</p></div>
      <div class="photo-gallery"><div class="photo one"><span>School community</span></div><div class="photo two"><span>Student activities</span></div><div class="photo three"><span>Campus life</span></div></div>
      <a class="rich-link-card" href="javascript:void(0)"><span class="link-thumbnail">↗</span><span><b>View event information and booking details</b><small>school.example/parent-evening</small></span></a>
      <div class="podcast-card"><span class="play-button">▶</span><span><b>Listen: A two-minute briefing</b><small>School podcast · 02:14</small></span></div>
      <div class="social-embed"><b>Repton High School</b><p>See the latest school stories and event highlights.</p><div class="social-actions"><span>Instagram</span><span>Facebook</span></div></div>
      <div class="feedback-block"><b>Was this communication useful?</b><div><button>Yes</button><button>No</button><button>I need help</button></div></div>
      <button class="campaign-cta">${copy.action}</button>
    </article>`;
}
function channelAnalytics(c){
  const intended=Number(String(c.analytics.intended).replaceAll(",",""))||0;
  const delivered=Number(String(c.analytics.delivered).replaceAll(",",""))||0;
  const failed=Number(String(c.analytics.failed).replaceAll(",",""))||0;
  return c.channels.map((channel,index)=>{
    const share=c.channels.length===1?1:[.58,.27,.15][index]||.15;
    const i=Math.round(intended*share), d=Math.round(delivered*share), f=Math.round(failed*share);
    const opened=channel==="Email"?c.analytics.emailOpened:channel==="Push"?c.analytics.pushOpened:channel==="WhatsApp"?(delivered?"76%":"—"):"—";
    return {channel,intended:i.toLocaleString(),delivered:d.toLocaleString(),failed:f.toLocaleString(),opened};
  });
}
function renderDetails(){
  const c=state.selected, body=document.querySelector("#detailBody");
  const views={
    content:`<div class="variant-controls">
        <div><label>Language</label><div class="segmented">${["English","Arabic","French"].map(l=>`<button data-content-language="${l}" class="${state.contentLanguage===l?"active":""}">${l}</button>`).join("")}</div></div>
        <div><label>Channel</label><div class="segmented">${c.channels.map(ch=>`<button data-content-channel="${ch}" class="${state.contentChannel===ch?"active":""}">${ch}</button>`).join("")}</div></div>
      </div>
      <div class="variant-note">One campaign contains a content version for each selected channel and language. Switching here previews that exact version.</div>
      ${channelPreview(c,state.contentLanguage,state.contentChannel)}`,
    audience:`<h3>Audience</h3><p>${c.audiences.length} selected audience group${c.audiences.length===1?"":"s"}</p><ul class="audience-list">${c.audiences.map((a,i)=>`<li>${a}<span style="float:right;color:var(--muted)">${[420,386,31,18,412][i]||120} recipients</span></li>`).join("")}</ul>`,
    analytics:`<h3>Channel analytics</h3><p>Delivery and engagement are separated by channel.</p>
      <div class="analytics-summary"><div><strong>${c.analytics.intended}</strong><span>Intended</span></div><div><strong>${c.analytics.delivered}</strong><span>Delivered</span></div><div><strong>${c.analytics.failed}</strong><span>Failed</span></div></div>
      <div class="channel-analytics"><div class="analytics-row analytics-head"><span>Channel</span><span>Intended</span><span>Delivered</span><span>Failed</span><span>Opened</span></div>
      ${channelAnalytics(c).map(r=>`<div class="analytics-row"><b>${r.channel}</b><span>${r.intended}</span><span>${r.delivered}</span><span>${r.failed}</span><span>${r.opened}</span></div>`).join("")}</div>
      <p><small>Open rates are shown only where the channel supports reliable tracking.</small></p>`,
    more:`<h3>Other details</h3><div class="content-card"><p><b>Status:</b> ${c.status}</p><p><b>Created by:</b> ${c.sender}</p><p><b>Approver:</b> ${c.approver}</p><p><b>Category:</b> ${c.category}</p><p><b>Original language:</b> ${c.language}</p><p><b>Channels:</b> ${c.channels.join(", ")}</p><p><b>Delivery date and time:</b> ${c.deliveredAt}</p>${c.rejection?`<p><b>Rejection reason:</b> ${c.rejection}</p>`:""}<p><b>Activity:</b> Created → Reviewed → ${c.status}</p></div>`
  }; body.innerHTML=views[state.detailTab];
}
function showDialog(action,id){
  const c=communications.find(x=>x.id===id), dialog=document.querySelector("#actionDialog");
  document.querySelector("#dialogTitle").textContent=action;
  const copy={Approve:`Approve “${c.campaign}” for delivery?`,Reject:`Reject “${c.campaign}” and return it to the creator?`,Reschedule:`Move “${c.campaign}” to a new date?`,Cancel:`Cancel the scheduled communication “${c.campaign}”?`,Duplicate:`Create a draft copy of “${c.campaign}”?`,"View rejection reason":c.rejection}[action];
  document.querySelector("#dialogCopy").textContent=copy;
  const reason=document.querySelector("#rejectionReason");reason.classList.toggle("hidden",action!=="Reject");reason.value="";
  const confirm=document.querySelector("#dialogConfirm");confirm.dataset.action=action;confirm.dataset.id=id;confirm.classList.toggle("hidden",action==="View rejection reason");
  dialog.showModal();
}
function toast(message){const el=document.querySelector("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function closeMobileNavigation(){sidebar.classList.remove("mobile-open");mobileNavScrim.classList.add("hidden")}
function renderMarkers(query=""){
  const normalized=query.toLowerCase();
  document.querySelector("#markerList").innerHTML=magicMarkers.filter(marker=>
    [marker.name,marker.token,marker.description].join(" ").toLowerCase().includes(normalized)
  ).map(marker=>`<button class="marker-item" data-marker="${marker.token}"><b>${marker.name}</b><small>${marker.description}</small><code>${marker.token}</code></button>`).join("");
}
function renderLanguageList(query=""){
  const normalized=query.toLowerCase();
  document.querySelector("#languageList").innerHTML=Object.entries(languageGroups).map(([group,languages])=>{
    const unique=[...new Set(languages)].filter(language=>language.toLowerCase().includes(normalized));
    if(!unique.length)return "";
    return `<section class="language-group"><h3>${group}</h3><div class="language-options">${unique.map(language=>`<label class="language-option"><input type="checkbox" value="${language}" ${composeState.languages.includes(language)?"checked":""} ${language==="English"?"disabled":""}><span>${language}</span></label>`).join("")}</div></section>`;
  }).join("");
}
function updateLanguageButton(){
  const languages=composeState.languages;
  document.querySelector("#languagePickerButton").innerHTML=languages.length<=2?`${languages.join(", ")} <span>▾</span>`:`English +${languages.length-1} languages <span>▾</span>`;
}
function previewAiChannel(channel){
  composeState.aiPreviewChannel=channel;
  document.querySelectorAll("[data-ai-preview-channel]").forEach(button=>button.classList.toggle("active",button.dataset.aiPreviewChannel===channel));
  const preview=document.querySelector("#aiGeneratedPreview");
  if(channel==="Push")preview.innerHTML=`<div class="device-preview push-preview"><div class="push-app"><span>R</span><b>Repton High School</b><small>now</small></div><h3>Parent evening is tomorrow</h3><p>Tap to review the details and confirm your booking.</p></div>`;
  else if(channel==="SMS")preview.innerHTML=`<div class="device-preview sms-preview"><div class="device-label">SMS preview</div><p>Repton High: Year 6 parent evening is tomorrow, 4–7 PM. Confirm: school.example/book</p></div>`;
  else preview.innerHTML=`<div class="preview-email"><span>REPTON HIGH SCHOOL</span><h3>Parent evening is tomorrow</h3><p>Dear {{Parent Name}},</p><p>We’re looking forward to welcoming you to the Year 6 parents’ evening tomorrow from 4:00–7:00 PM.</p><p>Please use {{Booking Link}} to confirm your preferred time.</p><button>Confirm attendance</button></div>`;
}
function addAiMessage(text,role="user"){
  const messages=document.querySelector("#aiChatMessages");
  messages.insertAdjacentHTML("beforeend",`<div class="chat-message ${role}"><b>${role==="user"?"You":"AI assistant"}</b><p>${text}</p></div>`);
  messages.scrollTop=messages.scrollHeight;
}
function showModule(page){
  closeDrawers();communicationsPage.classList.add("hidden");composePage.classList.add("hidden");modulePage.classList.remove("hidden");
  document.querySelectorAll(".nav-item[data-page]").forEach(button=>button.classList.toggle("active",button.dataset.page===page));
  const title=document.querySelector("#moduleTitle"),subtitle=document.querySelector("#moduleSubtitle"),content=document.querySelector("#moduleContent"),action=document.querySelector("#modulePrimaryAction");
  document.querySelector(".topbar strong").textContent=page[0].toUpperCase()+page.slice(1);
  if(page==="drafts"){
    title.textContent="Drafts";subtitle.textContent="Continue unfinished communications using the same list and Compose experience";action.textContent="＋ Compose";action.dataset.openCompose="";
    const draftRows=[
      ["Year 8 Trip Information","Message","Year 8 guardians","Email / Push","Draft","22 Jun 2026 · 09:40 AM"],
      ["Weekly School Newsletter","Circular","Whole school","Email / WhatsApp","Draft","21 Jun 2026 · 03:15 PM"],
      ["Emergency Weather Notice","Notice","Audience not selected","Push / SMS","Draft","18 Jun 2026 · 11:20 AM"]
    ];
    content.innerHTML=`<section class="list-card"><div class="list-toolbar"><div><h2>All drafts</h2><p>Saved communications that have not been submitted</p></div><div class="toolbar-actions"><input type="search" placeholder="Search drafts"><button class="secondary">Filters</button></div></div><div class="table-wrap"><table><thead><tr><th>Campaign name</th><th>Type</th><th>Audience</th><th>Channel</th><th>Status</th><th>Last edited</th><th></th></tr></thead><tbody>${draftRows.map((d,i)=>`<tr data-edit-draft="${i}"><td class="subject">${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td><td><span class="status scheduled">${d[4]}</span></td><td>${deliveryDateHTML(d[5])}</td><td><button class="more-button" data-edit-draft="${i}">…</button></td></tr>`).join("")}</tbody></table></div><div class="pagination"><span>1–3 of 3</span></div></section>`;
  } else if(page==="calendar"){
    title.textContent="Communication calendar";subtitle.textContent="See scheduled communications across the school";action.textContent="＋ New communication";action.dataset.openCompose="";
    const events={2:{label:"Fee reminder",id:4},5:{label:"Year 6 notice",id:2},9:{label:"Newsletter",id:3},12:{label:"Survey closes",id:1},16:{label:"Sports reminder",id:5},19:{label:"Parent evening",id:1},23:{label:"Term circular",id:3},26:{label:"Payment SMS",id:4}};
    content.innerHTML=`<section class="calendar-shell"><div class="calendar-toolbar"><h2>June 2026</h2><div><button class="secondary">‹</button> <button class="secondary">›</button></div></div><div class="calendar-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>`<div class="calendar-cell"><b>${day}</b></div>`).join("")}${Array.from({length:35},(_,i)=>`<div class="calendar-cell"><span>${i+1<=30?i+1:""}</span>${events[i+1]?`<button class="calendar-event" data-calendar-communication="${events[i+1].id}">${events[i+1].label}</button>`:""}</div>`).join("")}</div></section>`;
  } else if(page==="templates"){
    title.textContent="Templates";subtitle.textContent="Create and manage reusable communication starting points";action.textContent="＋ Create template";delete action.dataset.openCompose;action.dataset.createTemplate="";
    const templates=[
      ["Parent evening reminder","Message","Email, Push, SMS","Existing"],
      ["Weekly school newsletter","Circular","Email, WhatsApp","General"],
      ["Emergency closure","Notice","All channels","General"],
      ["Event invitation","Message","Email, Push","AI assisted"],
      ["Fee payment reminder","Message","Email, SMS","Existing"],
      ["Survey invitation","Message","Email, Push","General"]
    ];
    content.innerHTML=`<div class="template-library">${templates.map((t,i)=>`<article class="template-card"><span class="type-label">${t[3]}</span><h3>${t[0]}</h3><p>${t[1]} · ${t[2]}</p><footer><small>${i%2?"Edited 2 days ago":"Used 32 times"}</small><button class="secondary" data-use-template="${t[0]}">Use template</button></footer></article>`).join("")}</div>`;
  } else {
    title.textContent="Analytics";subtitle.textContent="Delivery and engagement across communication channels";action.textContent="Export report";delete action.dataset.openCompose;delete action.dataset.createTemplate;
    content.innerHTML=`<div class="module-period"><label for="analyticsPeriod"><b>Time period</b></label><select id="analyticsPeriod" class="period-select"><option>Last 7 days</option><option>Last 30 days</option><option selected>Last 3 months</option><option>Last 6 months</option><option>This academic year</option><option>Custom range</option></select><div id="analyticsCustomRange" class="custom-range hidden"><input type="date" value="2026-04-01"><input type="date" value="2026-06-22"><button class="secondary">Apply</button></div></div><div class="analytics-page-grid"><div class="analytics-page-card"><strong>248</strong><span>Communications</span></div><div class="analytics-page-card"><strong>42,680</strong><span>Recipients</span></div><div class="analytics-page-card"><strong>96.2%</strong><span>Delivered</span></div><div class="analytics-page-card"><strong>71.4%</strong><span>Opened / viewed</span></div></div><section class="analytics-breakdown"><h2>By channel · <span id="analyticsPeriodLabel">Last 3 months</span></h2><div class="channel-analytics"><div class="analytics-row analytics-head"><span>Channel</span><span>Sent</span><span>Delivered</span><span>Failed</span><span>Opened</span></div><div class="analytics-row"><b>Email</b><span>18,420</span><span>17,680</span><span>740</span><span>64%</span></div><div class="analytics-row"><b>Push</b><span>14,880</span><span>14,432</span><span>448</span><span>41%</span></div><div class="analytics-row"><b>SMS</b><span>6,240</span><span>6,010</span><span>230</span><span>—</span></div><div class="analytics-row"><b>WhatsApp</b><span>3,140</span><span>2,947</span><span>193</span><span>76%</span></div></div></section>`;
  }
  window.scrollTo({top:0,behavior:"smooth"});
}
function applySavedTemplate(name){
  const normalized=name.toLowerCase();
  if(normalized.includes("parent evening")){
    document.querySelector("#composeCampaign").value="Year 6 Parent Evening – Final Reminder";
    document.querySelector("#composeSubject").value="Parent evening is tomorrow";
    document.querySelector("#composeContent").value="Dear {{Parent Name}},\n\nA reminder that the Year 6 parent evening takes place tomorrow from 4:00–7:00 PM.\n\nPlease use {{Booking Link}} to confirm your slot.\n\nWarm regards,\n{{School Name}}";
  } else if(normalized.includes("newsletter")){
    document.querySelector("#composeCampaign").value="Weekly School Newsletter";
    document.querySelector("#composeSubject").value="This week at {{School Name}}";
    document.querySelector("#composeContent").value="Dear {{Parent Name}},\n\nHere are this week's news, events and important reminders for {{Student Name}}.";
  } else if(normalized.includes("emergency closure")){
    document.querySelector("#composeCampaign").value="Emergency School Closure";
    document.querySelector("#composeSubject").value="Important: school closure";
    document.querySelector("#composeContent").value="Dear {{Parent Name}},\n\n{{School Name}} will be closed today. Further updates will follow by SMS and Push.";
  } else {
    document.querySelector("#composeCampaign").value=name;
    document.querySelector("#composeSubject").value=name;
    document.querySelector("#composeContent").value="Dear {{Parent Name}},\n\nAdd your communication content here.\n\nWarm regards,\n{{School Name}}";
  }
  composeState.variants={};updateCharacterCount();
}
function selectedComposeChannels(){
  return [...document.querySelectorAll(".channel-option input:checked")].map(input=>input.value);
}
function defaultVariant(channel){
  const title=document.querySelector("#composeSubject").value;
  const email=document.querySelector("#composeContent").value;
  if(channel==="Push") return {subject:title,content:"Parent evening is tomorrow. Tap to view the details and confirm your booking."};
  if(channel==="SMS") return {subject:"",content:"Repton High: Year 6 parent evening is tomorrow, 4–7 PM. Confirm your booking: school.example/book"};
  if(channel==="WhatsApp") return {subject:title,content:"Dear {{Parent Name}}, a reminder that Year 6 parent evening is tomorrow from 4–7 PM. Confirm here: school.example/book"};
  return {subject:title,content:email};
}
function saveCurrentVariant(){
  if(composeState.step!==4)return;
  composeState.variants[composeState.activeChannel]={
    subject:document.querySelector("#composeSubject").value,
    content:document.querySelector("#composeContent").value
  };
}
function renderComposeChannelTabs(){
  const channels=selectedComposeChannels();
  if(!channels.includes(composeState.activeChannel))composeState.activeChannel=channels[0]||"Email";
  const tabs=document.querySelector("#composeChannelTabs");
  tabs.innerHTML=channels.map(channel=>`<button type="button" data-compose-channel="${channel}" class="${composeState.activeChannel===channel?"active":""}">${channel}</button>`).join("");
  const variant=composeState.variants[composeState.activeChannel]||defaultVariant(composeState.activeChannel);
  document.querySelector("#composeSubject").value=variant.subject;
  document.querySelector("#composeContent").value=variant.content;
  document.querySelector("#composeSubject").closest("label").classList.toggle("hidden",composeState.activeChannel==="SMS");
  updateCharacterCount();
}
function updateCharacterCount(){
  const content=document.querySelector("#composeContent").value;
  const limit=composeState.activeChannel==="SMS"?160:composeState.activeChannel==="Push"?180:null;
  document.querySelector("#characterCount").textContent=limit?`${content.length} / ${limit} characters`:`${content.length} characters`;
}
function buildComposeReview(){
  saveCurrentVariant();
  const channels=selectedComposeChannels();
  const delivery=document.querySelector('input[name="deliveryMode"]:checked').value;
  document.querySelector("#composeReview").innerHTML=[
    ["Campaign",document.querySelector("#composeCampaign").value],
    ["Type",document.querySelector("#composeType").value],
    ["Audience","8 groups · 1,842 guardians"],
    ["Channels",channels.join(", ")],
    ["Languages",composeState.languages.join(", ")],
    ["Media","1 photo · 1 rich link"],
    ["Delivery",delivery==="now"?"Send after approval":"Scheduled for 25 Jun 2026 · 09:00 AM"],
    ["Approval","Sarah Mitchell"]
  ].map(([label,value])=>`<div class="review-item"><b>${label}</b><span>${value}</span></div>`).join("");
}
function showComposeStep(step){
  composeState.step=step;
  document.querySelectorAll("[data-compose-step]").forEach(el=>el.classList.toggle("active",+el.dataset.composeStep===step));
  document.querySelectorAll("[data-step-indicator]").forEach(el=>{
    const number=+el.dataset.stepIndicator;
    el.classList.toggle("active",number===step);el.classList.toggle("complete",number<step);
  });
  document.querySelector("#composePrevious").classList.toggle("hidden",step===1);
  document.querySelector("#composeNext").textContent=step===5?"Submit for approval":"Continue";
  if(step===4)renderComposeChannelTabs();
  if(step===5)buildComposeReview();
  window.scrollTo({top:0,behavior:"smooth"});
}
function openCompose(){
  closeDrawers();communicationsPage.classList.add("hidden");modulePage.classList.add("hidden");composePage.classList.remove("hidden");
  document.querySelector(".topbar strong").textContent="New communication";
  composeState={step:1,activeChannel:"Email",variants:{},languages:["English"],aiPreviewChannel:"Email"};
  document.querySelector("#composeCampaign").value="";
  document.querySelector("#composeSubject").value="";
  document.querySelector("#composeContent").value="";
  document.querySelector("#composeTemplate").value="";
  document.querySelector("#savedTemplateField").classList.add("hidden");
  updateLanguageButton();
  document.querySelectorAll(".template-start").forEach(button=>button.classList.toggle("active",button.dataset.templateStart==="blank"));
  showComposeStep(1);
}
function exitCompose(){
  composePage.classList.add("hidden");modulePage.classList.add("hidden");communicationsPage.classList.remove("hidden");
  document.querySelectorAll(".nav-item[data-page]").forEach(button=>button.classList.toggle("active",button.dataset.page==="communications"));
  document.querySelector(".topbar strong").textContent="Communications";
  window.scrollTo({top:0,behavior:"smooth"});
}
function submitCompose(){
  saveCurrentVariant();
  communications.unshift({
    id:Math.max(...communications.map(c=>c.id))+1,
    campaign:document.querySelector("#composeCampaign").value,
    type:document.querySelector("#composeType").value,
    audiences:["Year 6","Year 7","Class 8A","Class 8B","Parent Committee","Boarding Parents","New Joiners","Learning Support"],
    channels:selectedComposeChannels(),status:"Pending approval",deliveredAt:"Not delivered",sender:"Administrator",
    approver:"Sarah Mitchell",category:document.querySelector("#composeCategory").value||"Uncategorised",language:composeState.languages[0],
    rejection:"",content:(composeState.variants.Email||defaultVariant("Email")).content,
    analytics:{intended:"1,842",delivered:"0",opened:"0",failed:"0",pushOpened:"—",emailOpened:"—"}
  });
  state.summary="all";document.querySelectorAll(".summary").forEach(x=>x.classList.toggle("active",x.dataset.summary==="all"));
  exitCompose();render();toast("Communication submitted for approval");
}

document.addEventListener("click",e=>{
  const navigation=e.target.closest(".nav-item[data-page]");if(navigation){
    closeMobileNavigation();
    if(navigation.dataset.page==="communications"){exitCompose();return}
    showModule(navigation.dataset.page);return
  }
  const calendarCommunication=e.target.closest("[data-calendar-communication]");if(calendarCommunication){showDetails(+calendarCommunication.dataset.calendarCommunication);return}
  if(e.target.closest("[data-open-compose]")){openCompose();return}
  if(e.target.closest("[data-edit-draft]")){
    const draftIndex=+e.target.closest("[data-edit-draft]").dataset.editDraft;
    openCompose();document.querySelector("#composeCampaign").value=["Year 8 Trip Information","Weekly School Newsletter","Emergency Weather Notice"][draftIndex];
    document.querySelector("#composeSubject").value=["Year 8 trip information","This week at Repton High","Important weather update"][draftIndex];
    document.querySelector("#composeContent").value=["Dear {{Parent Name}},\n\nPlease review the latest information for the Year 8 trip.","Dear {{Parent Name}},\n\nHere are this week's school updates.","Dear {{Parent Name}},\n\nWe are monitoring the weather and will share closure information shortly."][draftIndex];
    showComposeStep(4);return
  }
  const useTemplate=e.target.closest("[data-use-template]");if(useTemplate){openCompose();applySavedTemplate(useTemplate.dataset.useTemplate);showComposeStep(4);return}
  if(e.target.closest("[data-create-template]")){openCompose();document.querySelector("#aiTemplateDialog").showModal();return}
  const summary=e.target.closest("[data-summary]");if(summary){state.summary=summary.dataset.summary;document.querySelectorAll(".summary").forEach(x=>x.classList.toggle("active",x===summary));render();return}
  const menu=e.target.closest("[data-menu]");if(menu){e.stopPropagation();showMenu(menu,+menu.dataset.menu);return}
  const action=e.target.closest("[data-action]");if(action){closeMenus();if(action.dataset.action==="View")showDetails(+action.dataset.id);else showDialog(action.dataset.action,+action.dataset.id);return}
  const view=e.target.closest("[data-view]");if(view){showDetails(+view.dataset.view,view.dataset.tab||"content");return}
  if(e.target.closest("[data-close]")||e.target===scrim)closeDrawers();
  const tab=e.target.closest("[data-detail-tab]");if(tab){state.detailTab=tab.dataset.detailTab;document.querySelectorAll("[data-detail-tab]").forEach(b=>b.classList.toggle("active",b===tab));renderDetails()}
  const language=e.target.closest("[data-content-language]");if(language){state.contentLanguage=language.dataset.contentLanguage;renderDetails();return}
  const channel=e.target.closest("[data-content-channel]");if(channel){state.contentChannel=channel.dataset.contentChannel;renderDetails();return}
  const composeChannel=e.target.closest("[data-compose-channel]");if(composeChannel){saveCurrentVariant();composeState.activeChannel=composeChannel.dataset.composeChannel;renderComposeChannelTabs();return}
  const start=e.target.closest("[data-template-start]");if(start){
    document.querySelectorAll(".template-start").forEach(button=>button.classList.toggle("active",button===start));
    const mode=start.dataset.templateStart;
    document.querySelector("#savedTemplateField").classList.toggle("hidden",mode!=="saved");
    if(mode==="blank"){document.querySelector("#composeTemplate").value="";document.querySelector("#composeSubject").value="";document.querySelector("#composeContent").value="";composeState.variants={};updateCharacterCount()}
    if(mode==="ai")document.querySelector("#aiTemplateDialog").showModal();
    return
  }
  if(e.target.closest("[data-open-ai-template]")){document.querySelector("#aiTemplateDialog").showModal();return}
  if(e.target.closest("#languagePickerButton")){renderLanguageList();document.querySelector("#languageDialog").showModal();return}
  if(e.target.closest("[data-open-markers]")){renderMarkers();document.querySelector("#markerDialog").showModal();return}
  const previewChannel=e.target.closest("[data-ai-preview-channel]");if(previewChannel){previewAiChannel(previewChannel.dataset.aiPreviewChannel);return}
  const prompt=e.target.closest("[data-ai-prompt]");if(prompt){addAiMessage(prompt.dataset.aiPrompt);setTimeout(()=>addAiMessage(`Done — I’ve updated the draft to ${prompt.dataset.aiPrompt.toLowerCase()}. Review the preview on the right.`,"assistant"),250);document.querySelector("#aiPreviewStatus").textContent="Draft updated";return}
  const marker=e.target.closest("[data-marker]");if(marker){
    const editor=document.querySelector("#composeContent");
    editor.setRangeText(marker.dataset.marker,editor.selectionStart,editor.selectionEnd,"end");
    document.querySelector("#markerDialog").close();editor.focus();updateCharacterCount();return
  }
  const closeDialog=e.target.closest("[data-close-dialog]");if(closeDialog){document.querySelector(`#${closeDialog.dataset.closeDialog}`).close();return}
  const ai=e.target.closest("[data-ai-action]");if(ai){
    const editor=document.querySelector("#composeContent"),action=ai.dataset.aiAction;
    if(action==="proofread")editor.value=editor.value.replace("parent evening","parents’ evening");
    if(action==="rewrite")editor.value="Dear {{Parent Name}},\n\nWe’re looking forward to welcoming you to the Year 6 parents’ evening tomorrow, from 4:00–7:00 PM.\n\nPlease use your booking link to confirm your preferred time.\n\nWarm regards,\nRepton High School";
    if(action==="shorten")editor.value="Year 6 parents’ evening is tomorrow, 4:00–7:00 PM. Please confirm your slot using the booking link.";
    if(action==="variants"){saveCurrentVariant();["Push","SMS","WhatsApp"].forEach(ch=>composeState.variants[ch]=defaultVariant(ch));toast("Channel variants created")}
    updateCharacterCount();toast(`${ai.querySelector("b").textContent} applied`);return
  }
  if(!e.target.closest(".action-menu")&&!e.target.closest("[data-menu]"))closeMenus();
});
document.querySelector("#filterButton").onclick=()=>openDrawer(filterDrawer);
document.querySelector("#mobileMenuButton").onclick=()=>{sidebar.classList.add("mobile-open");mobileNavScrim.classList.remove("hidden")};
document.querySelector("#mobileMenuClose").onclick=closeMobileNavigation;
mobileNavScrim.onclick=closeMobileNavigation;
document.querySelector("#refreshButton").onclick=()=>{render();toast("Communications refreshed")};
document.querySelector("#listPeriod").onchange=e=>{document.querySelector("#summaryPeriodLabel").textContent=e.target.value;toast(`Showing ${e.target.value.toLowerCase()}`)};
document.querySelector("#tableSearch").oninput=e=>{state.search=e.target.value;render()};
document.querySelector("#globalSearch").oninput=e=>{state.search=e.target.value;document.querySelector("#tableSearch").value=e.target.value;render()};
document.querySelector("#applyFilters").onclick=()=>{
  state.filters=Object.fromEntries(new FormData(document.querySelector("#filterForm")).entries());
  const active=Object.entries(state.filters).filter(([,v])=>v);document.querySelector("#filterCount").textContent=active.length?`(${active.length})`:"";
  document.querySelector("#activeFilters").innerHTML=active.map(([k,v])=>`<button class="filter-chip" data-remove-filter="${k}">${v} ×</button>`).join("");
  closeDrawers();render();
};
document.querySelector("#clearFilters").onclick=()=>{document.querySelector("#filterForm").reset();state.filters={};document.querySelector("#filterCount").textContent="";document.querySelector("#activeFilters").innerHTML="";render()};
document.querySelector("#activeFilters").onclick=e=>{const key=e.target.dataset.removeFilter;if(key){state.filters[key]="";document.querySelector(`[name="${key}"]`).value="";e.target.remove();render()}};
document.querySelectorAll(".dialog-close").forEach(b=>b.onclick=()=>document.querySelector("#actionDialog").close());
document.querySelector("#exitCompose").onclick=exitCompose;
document.querySelector("#composePrevious").onclick=()=>showComposeStep(Math.max(1,composeState.step-1));
document.querySelector("#composeNext").onclick=()=>{
  if(composeState.step===1&&!document.querySelector("#composeCampaign").value.trim()){toast("Add a campaign name");return}
  if(composeState.step===1&&document.querySelector(".template-start.active")?.dataset.templateStart==="saved"&&!document.querySelector("#composeTemplate").value){toast("Select a saved template");return}
  if(composeState.step===3&&!selectedComposeChannels().length){toast("Select at least one channel");return}
  if(composeState.step===4&&(!document.querySelector("#composeContent").value.trim()||(composeState.activeChannel!=="SMS"&&!document.querySelector("#composeSubject").value.trim()))){toast("Complete the required content fields");return}
  if(composeState.step===5){submitCompose();return}
  if(composeState.step===4)saveCurrentVariant();
  showComposeStep(composeState.step+1);
};
document.querySelector("#saveDraft").onclick=()=>{document.querySelector("#draftSaved").textContent="Draft saved just now";toast("Draft saved")};
document.querySelectorAll(".channel-option input").forEach(input=>input.onchange=()=>{
  input.closest(".channel-option").classList.toggle("selected",input.checked);
});
document.querySelector("#composeContent").oninput=updateCharacterCount;
document.querySelector("#composeTemplate").onchange=e=>{if(e.target.value)applySavedTemplate(e.target.value)};
document.querySelector("#markerSearch").oninput=e=>renderMarkers(e.target.value);
document.querySelector("#languageSearch").oninput=e=>renderLanguageList(e.target.value);
document.querySelector("#applyLanguages").onclick=()=>{
  const selected=[...document.querySelectorAll("#languageList input:checked")].map(input=>input.value);
  composeState.languages=["English",...[...new Set(selected.filter(language=>language!=="English"))]];
  updateLanguageButton();document.querySelector("#languageDialog").close();toast(`${composeState.languages.length} languages selected`);
};
document.querySelector("#sendAiMessage").onclick=()=>{
  const message=document.querySelector("#aiTemplateBrief").value.trim();
  if(!message)return;
  addAiMessage(message);document.querySelector("#aiTemplateBrief").value="";
  document.querySelector("#aiPreviewStatus").textContent="Updating…";
  setTimeout(()=>{addAiMessage("I’ve updated the draft and kept the CTA clear. You can refine it further or use the draft in Compose.","assistant");document.querySelector("#aiPreviewStatus").textContent="Draft updated";},300);
};
document.querySelector("#regenerateAiTemplate").onclick=()=>{addAiMessage("Regenerate the template with a different structure.");document.querySelector("#aiPreviewStatus").textContent="Regenerated";toast("New draft generated")};
document.querySelector("#editAiDraft").onclick=()=>{
  document.querySelector("#composeCampaign").value="Year 6 Parent Evening – AI Draft";
  document.querySelector("#composeSubject").value="A reminder about tomorrow’s parent evening";
  document.querySelector("#composeContent").value="Dear {{Parent Name}},\n\nWe’re looking forward to welcoming you to the Year 6 parents’ evening tomorrow from 4:00–7:00 PM.\n\nPlease use {{Booking Link}} to confirm your preferred time.\n\nWarm regards,\n{{School Name}}";
  composeState.variants={};
  document.querySelector("#aiTemplateDialog").close();
  if(document.querySelector("#saveAsTemplate").checked)toast("Draft generated and saved to Templates");
  else toast("AI draft generated");
  showComposeStep(4);
};
document.querySelectorAll('input[name="deliveryMode"]').forEach(input=>input.onchange=()=>{
  document.querySelector("#scheduleFields").classList.toggle("hidden",input.value!=="schedule"||!input.checked);
});
document.querySelector("#moduleContent").addEventListener("change",e=>{
  if(e.target.id==="analyticsPeriod"){
    document.querySelector("#analyticsPeriodLabel").textContent=e.target.value;
    document.querySelector("#analyticsCustomRange").classList.toggle("hidden",e.target.value!=="Custom range");
  }
});
document.querySelector("#dialogConfirm").onclick=e=>{
  const action=e.target.dataset.action,id=+e.target.dataset.id,c=communications.find(x=>x.id===id);
  if(action==="Reject"&&!document.querySelector("#rejectionReason").value.trim()){toast("Please add a rejection reason");return}
  if(action==="Approve"){c.status="Sent";c.deliveredAt="22 Jun 2026 · 11:30 AM"}
  if(action==="Reject"){c.status="Rejected";c.deliveredAt="Not delivered";c.rejection=document.querySelector("#rejectionReason").value.trim()}
  if(action==="Cancel"){communications.splice(communications.indexOf(c),1)}
  if(action==="Reschedule"){c.status="Scheduled";c.deliveredAt="25 Jun 2026 · 09:00 AM"}
  document.querySelector("#actionDialog").close();render();toast(`${action} completed in prototype`);
};
render();
