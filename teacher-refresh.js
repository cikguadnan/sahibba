(() => {
  function currentCode(){
    const saved=localStorage.getItem('sahibbaActiveSession');
    const text=document.querySelector('#sessionLabel')?.textContent||'';
    const match=text.match(/\b(\d{4,6})\b/);
    return saved||match?.[1]||'';
  }
  function currentTurnLimit(){
    const text=document.querySelector('#sessionLabel')?.textContent||'';
    const match=text.match(/(\d+)s\s+setiap\s+giliran/i);
    return match?.[1]||'';
  }
  function joinUrl(code){return code?`https://cikguadnan.github.io/sahibba/?join=${encodeURIComponent(code)}#join`:''}
  function syncOverview(){
    const code=currentCode();
    const codeEl=document.querySelector('#teacherOverviewCode');
    const timeEl=document.querySelector('#teacherOverviewTime');
    const qr=document.querySelector('#teacherOverviewQr');
    const link=document.querySelector('#teacherOverviewLink');
    if(codeEl)codeEl.textContent=code||'----';
    const limit=currentTurnLimit();
    if(timeEl)timeEl.textContent=limit?`${limit}s setiap giliran`:'Menunggu tetapan permainan';
    if(code&&qr)qr.src='https://quickchart.io/qr?size=180&margin=1&text='+encodeURIComponent(joinUrl(code));
    if(link)link.textContent=code?joinUrl(code):'Cipta permainan untuk mendapatkan pautan murid';
    document.querySelectorAll('[data-live-link]').forEach(a=>a.href='live.html'+(code?'?code='+encodeURIComponent(code):''));
  }
  function addSidebarShortcuts(){
    const nav=document.querySelector('#dashboard .sideNav nav');
    if(!nav||nav.querySelector('[data-pro-home]'))return;
    const home=document.createElement('button');
    home.dataset.proHome='1';home.className='active';home.textContent='⌂ Papan Pemuka';
    home.onclick=()=>document.querySelector('#overview')?.scrollIntoView({behavior:'smooth'});
    nav.prepend(home);
    const pairing=document.createElement('button');
    pairing.dataset.proPair='1';pairing.textContent='♟ Atur Pasangan';
    pairing.onclick=()=>document.querySelector('#pairPlayers')?.click();
    const matchBtn=[...nav.querySelectorAll('button')].find(b=>b.dataset.section==='matchesPanel');
    if(matchBtn)matchBtn.after(pairing); else nav.append(pairing);
  }
  function enhance(){
    const dash=document.querySelector('#dashboard .dashboard');
    if(!dash)return;
    addSidebarShortcuts();
    const head=dash.querySelector('.dashHead');
    if(!document.querySelector('.teacherSessionStrip')){
      const strip=document.createElement('div');strip.className='teacherSessionStrip';
      strip.innerHTML=`
        <div class="teacherSessionCard">
          <div class="sessionIcon">♟</div>
          <div><small>Kod sesi aktif</small><strong id="teacherOverviewCode">----</strong><span id="teacherOverviewTime">Menunggu tetapan permainan</span></div>
        </div>
        <div class="teacherSessionCard teacherQrCard">
          <img id="teacherOverviewQr" alt="Kod QR permainan" />
          <div class="qrCopy"><small>Sertai permainan</small><strong>Imbas QR atau kongsi pautan</strong><span id="teacherOverviewLink">Cipta permainan untuk mendapatkan pautan murid</span></div>
        </div>`;
      if(head)head.after(strip); else dash.prepend(strip);
    }
    const actions=dash.querySelector('.dashActions');
    if(actions&&!actions.querySelector('[data-live-link]')){
      const existing=actions.querySelector('#liveGame,.liveProjectorBtn');
      if(existing){existing.dataset.liveLink='1';existing.textContent='▣ Buka Paparan Kelas'}
      else{
        const a=document.createElement('a');a.className='liveProjectorBtn';a.dataset.liveLink='1';a.target='_blank';a.rel='noreferrer';a.textContent='▣ Buka Paparan Kelas';actions.prepend(a);
      }
    }
    syncOverview();
    const label=document.querySelector('#sessionLabel');
    if(label&&!label.dataset.proObserved){label.dataset.proObserved='1';new MutationObserver(syncOverview).observe(label,{childList:true,subtree:true,characterData:true})}
  }
  addEventListener('hashchange',()=>setTimeout(enhance,0));
  addEventListener('DOMContentLoaded',enhance);
  setTimeout(enhance,300);
  setTimeout(enhance,1200);
})();
