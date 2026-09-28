
const EXT_ID = 'valko-little-wolf';
const STORE = 'valko_little_wolf_settings';
const defaults = {
  enabled: false,
  mascot: true,
  animations: true,
  paws: true,
  intensity: 70,
  pose: 'random',
};

let settings = {...defaults};

function load() {
  try { settings = {...defaults, ...JSON.parse(localStorage.getItem(STORE) || '{}')}; }
  catch { settings = {...defaults}; }
}
function save() { localStorage.setItem(STORE, JSON.stringify(settings)); }

function asset(name) {
  return new URL(`./assets/${name}`, import.meta.url).href;
}

function apply() {
  document.documentElement.classList.toggle('valko-theme-active', !!settings.enabled);
  document.documentElement.classList.toggle('valko-theme-animate', !!settings.enabled && !!settings.animations);
  document.documentElement.style.setProperty('--valko-intensity', String((settings.intensity || 70) / 100));
  const m=document.getElementById('valko-mascot');
  if (m) m.hidden = !(settings.enabled && settings.mascot);
  const ears=document.getElementById('valko-input-ears');
  if(ears) ears.hidden=!(settings.enabled && settings.paws);
}


function ensureInputEars(){
  if(document.getElementById('valko-input-ears')) return;
  const dock=document.querySelector('#send_form') || document.querySelector('#form_sheld');
  if(!dock) return;
  dock.classList.add('valko-ears-dock');
  const ears=document.createElement('img');
  ears.id='valko-input-ears';
  ears.src=new URL('./assets/valko-ears.png', import.meta.url).href;
  ears.alt='';
  ears.setAttribute('aria-hidden','true');
  dock.appendChild(ears);
}

function ensureMascot() {
  if (document.getElementById('valko-mascot')) return;
  const box=document.createElement('div');
  box.id='valko-mascot';
  box.hidden=true;
  box.innerHTML=`<img src="${asset('valko-chibi.png')}" alt="Valko"><span class="valko-sleep">zZ</span>`;
  const mascotImg=box.querySelector('img');
  const poses=[
    {src:asset('valko-chibi.png'), cls:'is-sitting'},
    {src:asset('valko-lounge.png'), cls:'is-lounging'},
    {src:asset('valko-heart.png'), cls:'is-heart'},
  ];
  let lastPose=-1;
  const pickPose=()=>{
    if(!settings.enabled || !settings.mascot) return;
    let i;
    if(settings.pose==='sitting') i=0;
    else if(settings.pose==='lounging') i=1;
    else if(settings.pose==='heart') i=2;
    else {
      i=Math.floor(Math.random()*poses.length);
      if(poses.length>1 && i===lastPose) i=(i+1)%poses.length;
    }
    lastPose=i;
    box.classList.remove('is-sitting','is-lounging','is-heart');
    box.classList.add(poses[i].cls);
    mascotImg.src=poses[i].src;
  };
  pickPose();
  const schedulePose=()=>{
    const delay=35000+Math.floor(Math.random()*40000);
    setTimeout(()=>{ pickPose(); schedulePose(); },delay);
  };
  schedulePose();
  const dock=()=>document.querySelector('#send_form') || document.querySelector('#form_sheld');
  const parent=dock();
  (parent || document.body).appendChild(box);
  if(parent) parent.classList.add('valko-mascot-dock');

  let typingTimer;
  document.addEventListener('input', e=>{
    if (!settings.enabled || !settings.mascot) return;
    if (!e.target?.matches?.('#send_textarea, textarea')) return;
    box.classList.add('is-listening');
    clearTimeout(typingTimer);
    typingTimer=setTimeout(()=>box.classList.remove('is-listening'),700);
  }, true);

  document.addEventListener('click', e=>{
    if (!settings.enabled || !settings.mascot) return;
    if (e.target?.closest?.('#send_but')) {
      box.classList.remove('is-bounce');
      void box.offsetWidth;
      box.classList.add('is-bounce');
      setTimeout(()=>box.classList.remove('is-bounce'),650);
    }
  }, true);
}

function mountSettings() {
  if (document.getElementById('valko-theme-settings')) return true;
  const host=document.querySelector('#extensions_settings2, #extensions_settings, .extensions_settings');
  if (!host) return false;
  const wrap=document.createElement('div');
  wrap.id='valko-theme-settings';
  wrap.className='extension_container';
  wrap.innerHTML=`
    <div class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b>🐺 Valko · Little Wolf</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content">
        <label class="checkbox_label"><input id="valko-enabled" type="checkbox"> <span>Включить тему Valko</span></label>
        <div class="valko-clean-card">
          <label>✨ Свечение <input id="valko-intensity" type="range" min="20" max="100" step="5"></label>
          <label class="checkbox_label"><input id="valko-paws" type="checkbox"> <span>Ушки на панели</span></label>
          <label class="checkbox_label"><input id="valko-mascot-toggle" type="checkbox"> <span>Показывать Валко</span></label>
          <label class="checkbox_label"><input id="valko-animations" type="checkbox"> <span>Лёгкие анимации</span></label>
          <label class="valko-pose-row"><span>Образ Валко</span>
            <select id="valko-pose">
              <option value="random">Случайно</option>
              <option value="sitting">Сидит</option>
              <option value="lounging">Лежит</option>
              <option value="heart">Сердечко 🫶🏻</option>
            </select>
          </label>
        </div>
        <button id="valko-preview" class="menu_button">👁 Предпросмотр темы</button>
      </div>
    </div>`;
  host.appendChild(wrap);
  const $=id=>wrap.querySelector('#'+id);
  $('valko-enabled').checked=settings.enabled;
  $('valko-intensity').value=settings.intensity;
  $('valko-paws').checked=settings.paws;
  $('valko-mascot-toggle').checked=settings.mascot;
  $('valko-animations').checked=settings.animations;
  $('valko-pose').value=settings.pose || 'random';

  $('valko-enabled').onchange=e=>{settings.enabled=e.target.checked;save();apply()};
  $('valko-intensity').oninput=e=>{settings.intensity=Number(e.target.value);save();apply()};
  $('valko-paws').onchange=e=>{settings.paws=e.target.checked;save();apply()};
  $('valko-mascot-toggle').onchange=e=>{settings.mascot=e.target.checked;save();apply()};
  $('valko-animations').onchange=e=>{settings.animations=e.target.checked;save();apply()};
  $('valko-pose').onchange=e=>{settings.pose=e.target.value;save();document.getElementById('valko-mascot')?.remove();ensureMascot();apply()};
  $('valko-preview').onclick=()=>{$('valko-enabled').click()};
  return true;
}
function init() {
  load();
  ensureMascot();
  ensureInputEars();
  apply();
  if (!mountSettings()) {
    let tries=0;
    const t=setInterval(()=>{ if(mountSettings() || ++tries>30) clearInterval(t); },500);
  }
}
if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
console.log('[Valko Theme] ready');
