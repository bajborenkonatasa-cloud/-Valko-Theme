
const EXT_ID = 'valko-little-wolf';
const STORE = 'valko_little_wolf_settings';
const defaults = {
  enabled: false,
  mascot: true,
  animations: true,
  paws: true,
  intensity: 70,
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
}

function ensureMascot() {
  if (document.getElementById('valko-mascot')) return;
  const box=document.createElement('div');
  box.id='valko-mascot';
  box.hidden=true;
  box.innerHTML=`<img src="${asset('valko-chibi.png')}" alt="Valko"><span class="valko-sleep">zZ</span>`;
  document.body.appendChild(box);

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
        <b>🐺 Valko · Little Wolf Theme <small>0.2.0</small></b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content">
        <label class="checkbox_label"><input id="valko-enabled" type="checkbox"> <span>Включить тему Valko</span></label>
        <div class="valko-help">Безопасный тест: OFF возвращает твою текущую тему SillyTavern/Hanabi.</div>
        <details class="valko-drawer">
          <summary>🎨 Основа темы <span>dark · teal · glass</span></summary>
          <label>Интенсивность свечения <input id="valko-intensity" type="range" min="20" max="100" step="5"></label>
          <label class="checkbox_label"><input id="valko-paws" type="checkbox"> <span>Лапки и декоративные акценты</span></label>
        </details>
        <details class="valko-drawer">
          <summary>🐺 Little Wolf <span>талисман</span></summary>
          <label class="checkbox_label"><input id="valko-mascot-toggle" type="checkbox"> <span>Показывать чибика</span></label>
          <label class="checkbox_label"><input id="valko-animations" type="checkbox"> <span>Лёгкие анимации</span></label>
          <div class="valko-help">v0.2.0: дыхание, реакция на ввод и маленький bounce при отправке.</div>
        </details>
        <button id="valko-preview" class="menu_button">👁 Переключить предпросмотр</button>
        <div class="valko-version">v0.2.0 · Foundation</div>
      </div>
    </div>`;
  host.appendChild(wrap);
  const $=id=>wrap.querySelector('#'+id);
  $('valko-enabled').checked=settings.enabled;
  $('valko-intensity').value=settings.intensity;
  $('valko-paws').checked=settings.paws;
  $('valko-mascot-toggle').checked=settings.mascot;
  $('valko-animations').checked=settings.animations;

  $('valko-enabled').onchange=e=>{settings.enabled=e.target.checked;save();apply()};
  $('valko-intensity').oninput=e=>{settings.intensity=Number(e.target.value);save();apply()};
  $('valko-paws').onchange=e=>{settings.paws=e.target.checked;save();apply()};
  $('valko-mascot-toggle').onchange=e=>{settings.mascot=e.target.checked;save();apply()};
  $('valko-animations').onchange=e=>{settings.animations=e.target.checked;save();apply()};
  $('valko-preview').onclick=()=>{$('valko-enabled').click()};
  return true;
}


function ensurePawRunner(){
  if(document.getElementById('valko-paw-runner')) return;
  const p=document.createElement('div'); p.id='valko-paw-runner';
  p.innerHTML='<span>🐾</span><span>🐾</span><span>🐾</span>';
  document.body.appendChild(p);
}
function watchGeneration(){
  const mascot=()=>document.getElementById('valko-mascot');
  let was=false;
  const tick=()=>{
    const busy=!!document.querySelector('#mes_stop:not(.displayNone), #send_but[style*="display: none"], .mes_stop');
    document.documentElement.classList.toggle('valko-generating', settings.enabled && busy);
    const m=mascot(); if(m) m.classList.toggle('is-generating',settings.enabled&&busy);
    if(was && !busy && settings.enabled && m){
      m.classList.add('is-done'); setTimeout(()=>m.classList.remove('is-done'),800);
    }
    was=busy;
  };
  setInterval(tick,650);
}

function init() {
  load();
  ensureMascot();
  ensurePawRunner();
  watchGeneration();
  apply();
  if (!mountSettings()) {
    let tries=0;
    const t=setInterval(()=>{ if(mountSettings() || ++tries>30) clearInterval(t); },500);
  }
}
if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
console.log('[Valko Theme] v0.2.0 ready');
