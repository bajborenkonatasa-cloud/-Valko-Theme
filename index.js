
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
  const pr=document.getElementById('valko-paw-runner');
  if(pr && (!settings.enabled || !settings.paws)) pr.classList.remove('is-on');
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
  const dock=()=>document.querySelector('#send_form') || document.querySelector('#form_sheld');
  const parent=dock();
  (parent || document.body).appendChild(box);
  if(parent) parent.classList.add('valko-mascot-dock');

  let typingTimer;
  document.addEventListener('input', e=>{
    if (!settings.enabled || !settings.mascot) return;
    if (!e.target?.matches?.('#send_textarea, textarea')) return;
    box.classList.add('is-listening');
    const ears=document.getElementById('valko-input-ears');
    if(ears){ ears.classList.remove('is-alert'); void ears.offsetWidth; ears.classList.add('is-alert'); setTimeout(()=>ears.classList.remove('is-alert'),380); }
    resetIdle();
    clearTimeout(typingTimer);
    typingTimer=setTimeout(()=>box.classList.remove('is-listening'),700);
  }, true);

  document.addEventListener('click', e=>{
    if (!settings.enabled || !settings.mascot) return;
    if (e.target?.closest?.('#send_but')) {
      resetIdle();
      box.classList.remove('is-bounce');
      void box.offsetWidth;
      box.classList.add('is-bounce');
      setTimeout(()=>box.classList.remove('is-bounce'),650);
    }
  }, true);

  let idleTimer;
  function resetIdle(){
    box.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{ if(settings.enabled && settings.mascot && !box.classList.contains('is-generating')) box.classList.add('is-idle'); },45000);
  }
  resetIdle();

  const dock=document.querySelector('#send_form') || document.querySelector('#form_sheld');
  if(dock && !document.getElementById('valko-paw-runner')){
    const paws=document.createElement('div'); paws.id='valko-paw-runner'; paws.innerHTML='<span>🐾</span><span>🐾</span><span>🐾</span>'; dock.appendChild(paws);
  }
  let wasGenerating=false;
  const syncGeneration=()=>{
    const stop=document.querySelector('#mes_stop, #stop_button, .mes_stop');
    const generating=!!(stop && getComputedStyle(stop).display!=='none') || document.body.classList.contains('generating') || document.body.classList.contains('is-generating');
    if(generating===wasGenerating) return;
    wasGenerating=generating;
    const paws=document.getElementById('valko-paw-runner');
    if(generating){ box.classList.remove('is-idle','is-done'); box.classList.add('is-generating'); if(paws && settings.paws) paws.classList.add('is-on'); }
    else { box.classList.remove('is-generating'); if(paws) paws.classList.remove('is-on'); if(settings.enabled && settings.animations){ box.classList.add('is-done'); setTimeout(()=>box.classList.remove('is-done'),650); } resetIdle(); }
  };
  new MutationObserver(syncGeneration).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setInterval(syncGeneration,1000);
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
        <b>🐺 Valko · Little Wolf Theme <small>0.5.0</small></b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content">
        <label class="checkbox_label"><input id="valko-enabled" type="checkbox"> <span>Включить тему Valko</span></label>
        <div class="valko-help">Безопасный тест: OFF возвращает твою текущую тему SillyTavern/Hanabi.</div>
        <details class="valko-drawer">
          <summary>🎨 Основа темы <span>dark · teal · glass</span></summary>
          <label>Интенсивность свечения <input id="valko-intensity" type="range" min="20" max="100" step="5"></label>
        </details>
        <details class="valko-drawer">
          <summary>🐺 Little Wolf <span>талисман</span></summary>
          <label class="checkbox_label"><input id="valko-mascot-toggle" type="checkbox"> <span>Показывать чибика</span></label>
          <label class="checkbox_label"><input id="valko-animations" type="checkbox"> <span>Лёгкие анимации</span></label>
          <label class="checkbox_label"><input id="valko-paws" type="checkbox"> <span>Лапки во время генерации</span></label>
          <div class="valko-help">v0.5.0: ушки слушают ввод, Valko реагирует на генерацию/завершение и засыпает в простое.</div>
        </details>
        <button id="valko-preview" class="menu_button">👁 Переключить предпросмотр</button>
        <div class="valko-version">v0.5.0 · Foundation</div>
      </div>
    </div>`;
  host.appendChild(wrap);
  const $=id=>wrap.querySelector('#'+id);
  $('valko-enabled').checked=settings.enabled;
  $('valko-intensity').value=settings.intensity;
  $('valko-mascot-toggle').checked=settings.mascot;
  $('valko-animations').checked=settings.animations;
  $('valko-paws').checked=settings.paws;

  $('valko-enabled').onchange=e=>{settings.enabled=e.target.checked;save();apply()};
  $('valko-intensity').oninput=e=>{settings.intensity=Number(e.target.value);save();apply()};
  $('valko-mascot-toggle').onchange=e=>{settings.mascot=e.target.checked;save();apply()};
  $('valko-animations').onchange=e=>{settings.animations=e.target.checked;save();apply()};
  $('valko-paws').onchange=e=>{settings.paws=e.target.checked;save();apply()};
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
console.log('[Valko Theme] v0.5.0 ready');
