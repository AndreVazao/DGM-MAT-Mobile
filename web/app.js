// Path: C:\ProgramasGodMode\DGM-MAT-Mobile\web\app.js
const RENDEZVOUS="https://dgm-mat-rendezvous.vercel.app/api/rendezvous?public=1&node=PC-Vazao-Anjos";
const STORAGE="dgm-mat-mobile-state-v1";
const SESSION_STORAGE="dgm-mat-mobile-session-v1";
let session={};try{session=JSON.parse(localStorage.getItem(SESSION_STORAGE)||"{}")}catch(e){session={}}
let state={};try{state=JSON.parse(localStorage.getItem(STORAGE)||"{}")}catch(e){try{localStorage.removeItem(STORAGE)}catch(_){}state={}}
state.threads=Array.isArray(state.threads)?state.threads:[];state.activeId=state.activeId||null;state.apiBase=state.apiBase||"";state.pending=Array.isArray(state.pending)?state.pending:[];
const el={drawer:document.getElementById("drawer"),list:document.getElementById("threadList"),chat:document.getElementById("chat"),input:document.getElementById("input"),dot:document.getElementById("dot"),connection:document.getElementById("connectionText"),title:document.getElementById("titleButton"),context:document.getElementById("contextLine"),intent:document.getElementById("intentBar"),dialog:document.getElementById("renameDialog"),renameInput:document.getElementById("renameInput"),endpoint:document.getElementById("endpointLabel")};
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(e){showNotice("Não foi possível guardar o estado local neste dispositivo.")}}
function esc(v){return String(v==null?"":v).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]})}
function makeId(){return typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function"?crypto.randomUUID():""+Date.now()+"-"+Math.random().toString(36).slice(2)}
function api(path,opt){opt=opt||{};opt.headers=Object.assign({"Content-Type":"application/json"},opt.headers||{});if(session.access_token&&Number(session.expires_at)>Date.now()/1000)opt.headers.Authorization="Bearer "+session.access_token;else if(session.access_token){session={};try{localStorage.removeItem(SESSION_STORAGE)}catch(e){}}return fetch(state.apiBase+path,opt)}
function online(ok,msg){el.dot.classList.toggle("online",ok);el.connection.textContent=msg}
function isNativeApp(){return Boolean(window.Capacitor&&typeof window.Capacitor.isNativePlatform==="function"&&window.Capacitor.isNativePlatform())}
document.documentElement.classList.toggle("native-app",isNativeApp());
async function discover(){const native=isNativeApp();if(!native&&(location.hostname.includes("tail")||location.hostname.match(/^100\./)||location.hostname==="localhost"||location.hostname==="127.0.0.1")){state.apiBase="";save();return true}try{const r=await fetch(RENDEZVOUS,{cache:"no-store"});if(!r.ok)throw Error("rendezvous HTTP "+r.status);const d=await r.json();const endpoint=d&&d.node&&d.node.endpoint;if(endpoint){state.apiBase=String(endpoint).replace(/\/$/,"");save();return true}state.apiBase="";save();return false}catch(e){state.apiBase="";save();return false}}
async function connect(){if(!(await discover())){online(false,"PC não encontrado · modo offline");return false}try{const r=await api("/mobile/status");if(r.status===401||r.status===403){online(false,"PC encontrado · emparelhamento necessário");return false}if(!r.ok)throw Error(r.status);const d=await r.json();online(true,"PC ligado · DGM-MAT pronto");el.endpoint.textContent=d.tailscale&&d.tailscale.hostname||"PC";return true}catch(e){online(false,"PC indisponível · modo offline");return false}}
function active(){return state.threads.find(function(t){return t.id===state.activeId})||null}
function renderThreads(){el.list.innerHTML=state.threads.map(function(t){return '<button class="thread '+(t.id===state.activeId?"active":"")+'" data-id="'+esc(t.id)+'"><span class="thread-title">'+esc(t.title||"Nova conversa")+'</span><span class="thread-meta">'+new Date(t.updated_at||Date.now()).toLocaleString("pt-PT",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})+'</span></button>'}).join("")}
function renderChat(){const t=active();el.title.textContent=t&&t.title||"Nova conversa";el.context.textContent=t&&t.repository?(t.repository+(t.project?" · "+t.project:"")):"DGM-MAT · conversa contínua";el.chat.innerHTML=(t&&t.messages||[]).map(function(m){return '<div class="message-row '+(m.role==="user"?"user":"")+'"><div class="message '+(m.role==="user"?"user":"assistant")+' '+(m.state==="pending"?"pending":"")+'">'+esc(m.content)+'<div class="meta">'+(m.role==="user"?"Tu":"DGM-MAT")+" · "+new Date(m.created_at||Date.now()).toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"})+(m.state==="pending"?" · pendente":"")+"</div></div></div>"}).join("");el.chat.scrollTop=el.chat.scrollHeight;renderThreads()}
function localThread(){const t={id:"local-"+makeId(),title:"Nova conversa",created_at:new Date().toISOString(),updated_at:new Date().toISOString(),messages:[],status:"active"};state.threads.unshift(t);state.activeId=t.id;save();renderChat();return t}
async function createServer(title){const r=await api("/mobile/threads",{method:"POST",body:JSON.stringify({title:title||"Nova conversa"})});if(!r.ok)throw Error(r.status);return r.json()}
async function serverThread(t){if(!t.id.startsWith("local-"))return t;const s=await createServer(t.title);const i=state.threads.findIndex(function(x){return x.id===t.id});if(i>=0){state.threads[i]=s;state.activeId=s.id}save();return s}
async function load(){if(!(await connect())){if(!state.threads.length)localThread();renderChat();return}try{const r=await api("/mobile/threads");if(!r.ok)throw Error(r.status);const d=await r.json();state.threads=d.threads||[];if(!state.activeId||!state.threads.some(function(t){return t.id===state.activeId}))state.activeId=state.threads[0]&&state.threads[0].id||null;if(!state.activeId){const t=await createServer();state.threads=[t];state.activeId=t.id}save();renderChat();await flush()}catch(e){if(!state.threads.length)localThread();renderChat();showNotice("Não foi possível carregar as conversas: "+(e&&e.message||"erro desconhecido"))}}
async function select(id){state.activeId=id;save();const t=active();if(t&&!t.id.startsWith("local-")&&await connect())try{const r=await api("/mobile/threads/"+encodeURIComponent(id));if(r.ok){const s=await r.json(),i=state.threads.findIndex(function(x){return x.id===id});if(i>=0)state.threads[i]=s;save()}}catch(e){}renderChat();el.drawer.classList.remove("open")}
function showNotice(message){el.intent.classList.remove("hidden");el.intent.textContent=message}
function showIntent(i){if(!i){el.intent.classList.add("hidden");return}el.intent.classList.remove("hidden");const labels={chat:"conversa",status:"estado",audit:"auditoria",repair:"reparação",implement:"implementação",sync:"sincronização",research:"investigação",memory:"memória",deploy:"publicação"};el.intent.innerHTML="<strong>Entendido como "+esc(labels[i.intent]||i.intent)+"</strong> · confiança "+Math.round((i.confidence||0)*100)+"%"+(i.requires_approval?" · aprovação necessária":"")}
async function send(){const value=el.input.value.trim();if(!value)return;let t=active()||localThread();const pending={id:"pending-"+makeId(),role:"user",content:value,created_at:new Date().toISOString(),state:"pending"};t.messages.push(pending);t.updated_at=pending.created_at;el.input.value="";save();renderChat();if(!(await connect())){state.pending.push({threadId:t.id,content:value});save();showNotice("Mensagem guardada neste telemóvel, mas NÃO enviada: não foi possível localizar o PC DGM-MAT.");return}try{t=await serverThread(t);const r=await api("/mobile/threads/"+encodeURIComponent(t.id)+"/messages",{method:"POST",body:JSON.stringify({content:value})});if(!r.ok)throw Error(r.status);const d=await r.json(),i=state.threads.findIndex(function(x){return x.id===t.id});if(i>=0)state.threads[i]=d.thread;save();renderChat();showIntent(d.intent);const latest=(state.threads.find(function(x){return x.id===t.id})||{}).messages||[];const reply=[...latest].reverse().find(function(m){return m.role!=="user"&&m.content});if(reply)speakText(reply.content)}catch(e){state.pending.push({threadId:t.id,content:value});save();online(false,"PC indisponível · mensagem guardada");showNotice("Falha ao enviar ("+(e&&e.message||"erro desconhecido")+"). A mensagem ficou guardada neste telemóvel e continua pendente.")}}
async function flush(){if(!(await connect()))return;for(const item of state.pending.slice()){try{let t=state.threads.find(function(x){return x.id===item.threadId});if(!t)continue;t=await serverThread(t);const r=await api("/mobile/threads/"+encodeURIComponent(t.id)+"/messages",{method:"POST",body:JSON.stringify({content:item.content})});if(!r.ok)throw Error(r.status);const d=await r.json(),i=state.threads.findIndex(function(x){return x.id===t.id});if(i>=0)state.threads[i]=d.thread;state.pending=state.pending.filter(function(x){return x!==item});save();showIntent(d.intent)}catch(e){break}}renderChat()}
async function rename(){const t=active();if(!t)return;el.renameInput.value=t.title||"Nova conversa";el.dialog.showModal()}
document.getElementById("saveRename").addEventListener("click",async function(e){e.preventDefault();const title=el.renameInput.value.trim(),t=active();if(!title||!t)return;if(t.id.startsWith("local-"))t.title=title;else if(await connect()){const r=await api("/mobile/threads/"+encodeURIComponent(t.id)+"/rename",{method:"POST",body:JSON.stringify({title:title})});if(r.ok){const s=await r.json(),i=state.threads.findIndex(function(x){return x.id===t.id});if(i>=0)state.threads[i]=s}}save();renderChat();el.dialog.close()});
document.getElementById("newChat").onclick=function(){localThread();el.drawer.classList.remove("open")};document.getElementById("openDrawer").onclick=function(){el.drawer.classList.add("open")};document.getElementById("closeDrawer").onclick=function(){el.drawer.classList.remove("open")};document.getElementById("renameButton").onclick=rename;el.title.onclick=rename;document.getElementById("refresh").onclick=load;el.list.onclick=function(e){const b=e.target.closest("[data-id]");if(b)select(b.dataset.id)};document.getElementById("composer").onsubmit=function(e){e.preventDefault();send()};el.input.addEventListener("input",function(){el.input.style.height="auto";el.input.style.height=Math.min(el.input.scrollHeight,160)+"px"});el.input.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}});window.addEventListener("error",function(e){try{showNotice("Erro na interface: "+(e.message||"JavaScript"))}catch(_){}});window.addEventListener("unhandledrejection",function(e){try{showNotice("Erro inesperado: "+(e.reason&&e.reason.message||e.reason||"desconhecido"))}catch(_){}});window.addEventListener("online",flush);if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(function(){});load();setInterval(function(){if(!document.hidden)flush()},15000);


// Cockpit navigation: only call existing read endpoints; unavailable APIs are reported honestly.
const cockpitPanels = {
  office: {title:"Escritório virtual DGM-MAT", endpoint:"/runtime/office/telemetry", summary:"Telemetria real, minimizada e apenas de leitura; departamentos sem feed permanecem sem telemetria."},
  projects: {title:"Projetos e repositórios", endpoint:"/runtime/workspace/scan", summary:"Projetos e repositórios detetados pelo PC."},
  agents: {title:"Agentes e departamentos", endpoint:"/runtime/status", summary:"Estado observado do runtime e agentes reportados pelo PC."},
  providers: {title:"IAs e providers", endpoint:"/runtime/providers", summary:"Estado do registo e disponibilidade observada dos providers; não altera configurações."},
  missions: {title:"Missões e atividade", endpoint:"/runtime/missions", summary:"Missões registadas e respetivo estado."},
  approvals: {title:"Aprovações e segurança", endpoint:"/runtime/approvals", summary:"Consulta de aprovações, se o backend disponibilizar este endpoint."}
};
function renderOfficeTelemetry(data){
  if(!data||data.schema!=="dgm-mat.office-telemetry.v1")throw Error("Contrato de telemetria do escritório desconhecido.");
  const labels={active:"Ativo",waiting:"À espera",idle:"Em espera",unknown:"Sem telemetria",unavailable:"Indisponível",offline:"Offline",degraded:"Degradado"};
  const stateClass={active:"active",waiting:"waiting",idle:"idle",unknown:"unknown",unavailable:"unknown",offline:"unknown",degraded:"degraded"};
  const departments=[["engineering","Engenharia"],["approvals","Aprovações e segurança"],["operations","Operações"],["research","Investigação"],["memory","Memória"],["agents","Agentes"]];
  const deptHtml=departments.map(function(item){
    const d=data.departments&&data.departments[item[0]]||{};
    const status=String(d.state||"unknown").toLowerCase();
    const label=Object.prototype.hasOwnProperty.call(labels,status)?labels[status]:"Sem telemetria";
    const detail=d.reason||"Não existe uma fonte observável para este estado.";
    return '<article class="office-dept"><div class="office-dept-top"><strong>'+esc(item[1])+'</strong><span class="office-state '+(stateClass[status]||"unknown")+'">'+label+'</span></div><p>'+esc(detail)+'</p></article>';
  }).join("");
  const missions=data.missions||{}, counts=missions.counts||{}, active=Number(counts.RUNNING||0);
  const waiting=Number((data.departments&&data.departments.approvals&&data.departments.approvals.waiting_decisions)||0);
  const total=Number(missions.total||0), queue=data.queue_worker||{};
  const recent=Array.isArray(missions.recent)?missions.recent.slice(0,8):[];
  const recentHtml=recent.length?recent.map(function(m){
    const id=String(m.mission_id||"missão").slice(0,18), status=String(m.status||"unknown");
    const when=m.updated_at?new Date(m.updated_at).toLocaleString("pt-PT",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"hora desconhecida";
    const handler=m.handler?'<span>Executor: '+esc(m.handler)+'</span>':"";
    return '<li class="office-activity"><div><strong>'+esc(id)+'</strong><span>'+esc(status)+'</span></div><small>'+esc(when)+'</small>'+handler+'</li>';
  }).join(""):'<li class="office-empty">Ainda não existem missões persistidas para apresentar.</li>';
  const runtime=data.runtime||{}, runtimeStatus=String(runtime.status||"unknown");
  const runtimeLabel=runtime.is_degraded?"Degradado":(runtimeStatus==="unknown"?"Desconhecido":runtimeStatus);
  return '<div class="office-live"><div class="office-live-heading"><span class="office-live-dot"></span><span>Snapshot observado · '+esc(data.generated_at||"hora desconhecida")+'</span></div>'+
    '<div class="office-metrics"><article><span>Missões registadas</span><strong>'+total+'</strong></article><article><span>Em execução</span><strong>'+active+'</strong></article><article><span>Decisões pendentes</span><strong>'+waiting+'</strong></article></div>'+
    '<div class="office-runtime"><span>Runtime: <strong>'+esc(runtimeLabel)+'</strong></span><span>Worker da fila: <strong>'+(queue.worker_alive===true?"ativo":queue.worker_alive===false?"inativo":"desconhecido")+'</strong></span></div>'+
    '<h3>Departamentos observados</h3><div class="office-departments">'+deptHtml+'</div><h3>Atividade recente</h3><ul class="office-activity-list">'+recentHtml+'</ul>'+
    '<p class="office-truth-note">Esta vista só lê telemetria. Não mostra objetivos de missão nem conteúdo de conversas e não executa nem aprova ações. “Sem telemetria” significa que não existe feed real suficiente — não significa que o departamento esteja parado.</p></div>';
}
const cockpitDialog=document.getElementById("cockpitDialog");
async function openCockpitPanel(name){
  const panel=cockpitPanels[name]; if(!panel)return;
  document.getElementById("cockpitTitle").textContent=panel.title;
  document.getElementById("cockpitSummary").textContent=panel.summary;
  const body=document.getElementById("cockpitContent");
  body.textContent="A consultar o DGM-MAT no PC…";
  el.drawer.classList.remove("open"); cockpitDialog.showModal();
  try{
    if(!(await discover()))throw Error("PC não encontrado. Esta vista requer ligação ao PC.");
    const response=await api(panel.endpoint);
    const data=await response.json().catch(function(){return{}});
    if(!response.ok)throw Error((data&&data.detail)||("HTTP "+response.status));
    if(name==="office")body.innerHTML=renderOfficeTelemetry(data);
    else body.textContent=JSON.stringify(data,null,2);
    document.getElementById("cockpitSummary").textContent="Dados recebidos do backend · "+panel.summary;
  }catch(error){
    body.textContent="Esta função não está disponível neste momento.\n"+((error&&error.message)||String(error))+"\n\nNão foram efetuadas alterações.";
    document.getElementById("cockpitSummary").textContent="Consulta indisponível; não foram inventados resultados.";
  }
}
document.querySelectorAll("[data-panel]").forEach(function(button){
  button.addEventListener("click",function(){openCockpitPanel(button.dataset.panel)});
});

// Voice is progressive enhancement: use Android/WebView speech APIs only when available.
let voiceReplies=false;
let recognition=null;
function voiceNotice(message){showNotice(message)}
function speakText(text){
  if(!voiceReplies||!("speechSynthesis" in window)||!text)return;
  try{window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="pt-PT";window.speechSynthesis.speak(utterance)}catch(error){voiceNotice("A leitura em voz alta não está disponível neste dispositivo.")}
}
document.getElementById("speakToggle").addEventListener("click",function(){
  voiceReplies=!voiceReplies;
  this.classList.toggle("voice-active",voiceReplies);
  this.textContent=voiceReplies?"🔈":"🔊";
  if(!voiceReplies&&"speechSynthesis" in window)window.speechSynthesis.cancel();
  voiceNotice(voiceReplies?"Respostas faladas ativadas.":"Respostas faladas desativadas.");
});
document.getElementById("voiceInput").addEventListener("click",function(){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){voiceNotice("O reconhecimento de voz não está disponível neste Android/WebView. Usa o microfone do teclado ou atualiza o WebView/serviço de voz.");return}
  if(recognition){try{recognition.stop()}catch(e){}recognition=null;this.classList.remove("voice-active");this.textContent="🎙";return}
  try{
    recognition=new SpeechRecognition();recognition.lang="pt-PT";recognition.interimResults=true;recognition.continuous=false;
    this.classList.add("voice-active");this.textContent="■";
    recognition.onresult=function(event){
      let transcript="",finalResult=false;
      for(let i=event.resultIndex;i<event.results.length;i++){transcript+=event.results[i][0].transcript;if(event.results[i].isFinal)finalResult=true}
      if(transcript)el.input.value=transcript.trim();
      el.input.style.height="auto";el.input.style.height=Math.min(el.input.scrollHeight,160)+"px";
      if(finalResult&&el.input.value.trim()){const message=el.input.value.trim();recognition=null;document.getElementById("voiceInput").classList.remove("voice-active");document.getElementById("voiceInput").textContent="🎙";send();}
    };
    recognition.onerror=function(event){voiceNotice("Falha no reconhecimento de voz: "+(event.error||"erro desconhecido"));};
    recognition.onend=function(){recognition=null;document.getElementById("voiceInput").classList.remove("voice-active");document.getElementById("voiceInput").textContent="🎙";};
    recognition.start();voiceNotice("A ouvir em português. Fala agora; confirma as ações sensíveis antes de as executar.");
  }catch(error){recognition=null;this.classList.remove("voice-active");this.textContent="🎙";voiceNotice("Não foi possível iniciar o microfone: "+((error&&error.message)||String(error)))}
});

// USB/ADB recovery controls. API authorization remains fail-closed; a 401 is
// shown honestly rather than attempting to bypass PC-side session security.
const usbDialog=document.getElementById("usbDialog");
const usbStatus=document.getElementById("usbStatus");
const usbReport=document.getElementById("usbReport");
function usbPrint(value){usbReport.textContent=typeof value==="string"?value:JSON.stringify(value,null,2)}
async function usbRequest(path,opt){
  if(!(await discover()))throw Error("PC não encontrado pelo rendezvous. O monitor ADB, se ativo, continua a funcionar localmente no PC.");
  const response=await api(path,opt||{});
  const body=await response.json().catch(function(){return{}});
  if(!response.ok){
    if(response.status===401||response.status===403)throw Error("O PC recusou o pedido por falta de sessão autenticada. O emparelhamento remoto seguro ainda precisa de ser concluído; não vamos contornar a segurança.");
    throw Error(body.detail||("HTTP "+response.status));
  }
  return body;
}
async function usbLoadState(){
  usbStatus.textContent="A consultar o monitor USB/ADB do PC…";
  usbPrint("A carregar diagnóstico…");
  try{
    const data=await usbRequest("/mobile/usb-recovery/state");
    usbStatus.textContent="Monitor: "+(data.status||"desconhecido")+" · "+(data.enabled?"ativo":"inativo");
    usbPrint(data);
  }catch(error){
    usbStatus.textContent="Monitorização automática é executada no PC; estado remoto indisponível.";
    usbPrint((error&&error.message)||String(error));
  }
}
async function usbAction(action,confirmInstall){
  usbStatus.textContent="A executar: "+action+"…";
  try{
    const data=await usbRequest("/mobile/usb-recovery/repair",{method:"POST",body:JSON.stringify({action:action,confirm_install:Boolean(confirmInstall)})});
    usbStatus.textContent="Resultado: "+(data.status||"sem estado")+" · "+action;
    usbPrint(data);
  }catch(error){
    usbStatus.textContent="Não foi possível executar a ação.";
    usbPrint((error&&error.message)||String(error));
  }
}
document.getElementById("openUsbSettings").addEventListener("click",function(){
  el.drawer.classList.remove("open");
  usbDialog.showModal();
  usbLoadState();
});
document.getElementById("usbDiagnose").addEventListener("click",async function(){
  try{
    const data=await usbRequest("/mobile/usb-recovery/diagnose");
    usbStatus.textContent="Diagnóstico concluído.";
    usbPrint(data);
  }catch(error){
    usbStatus.textContent="Diagnóstico remoto indisponível.";
    usbPrint((error&&error.message)||String(error));
  }
});
document.getElementById("usbReconnect").addEventListener("click",function(){usbAction("reconnect-offline",false)});
document.getElementById("usbRestart").addEventListener("click",function(){
  if(window.confirm("Reiniciar o serviço ADB do PC? Isto pode interromper momentaneamente outras sessões ADB, mas não apaga dados."))usbAction("restart-adb-server",false);
});
document.getElementById("usbInstall").addEventListener("click",function(){
  if(window.confirm("Confirmas reinstalar o APK DGM-MAT no único telemóvel ADB autorizado? A opção -r preserva os dados da aplicação. Não será executado se não existir um APK válido."))usbAction("install-apk",true);
});


async function pairMobileClient(){
  const input=document.getElementById("usbPairCode");
  const code=input.value.trim();
  if(!code){usbStatus.textContent="Introduz o código gerado no browser do PC.";return}
  usbStatus.textContent="A validar o código de emparelhamento…";
  try{
    if(!(await discover()))throw Error("PC não encontrado. Confirma a ligação e o rendezvous.");
    const response=await fetch(state.apiBase+"/auth/pair",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:code,client_id:"dgm-mat-mobile-android"})});
    const body=await response.json().catch(function(){return{}});
    if(!response.ok)throw Error(body.detail||("HTTP "+response.status));
    session={access_token:body.access_token,expires_at:body.expires_at,session_id:body.session_id};
    localStorage.setItem(SESSION_STORAGE,JSON.stringify(session));
    input.value="";
    usbStatus.textContent="Telemóvel emparelhado com sessão temporária. A carregar estado do DGM-MAT…";
    usbPrint({status:"paired",expires_at:body.expires_at,scopes:body.scopes});
    await load();
    await usbLoadState();
  }catch(error){
    usbStatus.textContent="Emparelhamento não concluído.";
    usbPrint((error&&error.message)||String(error));
  }
}
document.getElementById("usbPair").addEventListener("click",pairMobileClient);
