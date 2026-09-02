(() => {
  function currentCode(){
    const saved=localStorage.getItem('sahibbaActiveSession');
    const text=document.querySelector('#sessionLabel')?.textContent||'';
    const match=text.match(/\b(\d{4,6})\b/);
    return saved||match?.[1]||'';
  }
  function enhance(){
    const dash=document.querySelector('#dashboard .dashboard');
    if(!dash||document.querySelector('.teacherRefreshBar')) return;
    const head=dash.querySelector('.dashHead');
    const bar=document.createElement('div');
    bar.className='teacherRefreshBar';
    bar.innerHTML='<div><strong>Dashboard langsung untuk kelas</strong><span>Skor, giliran dan aktiviti dikemas kini terus daripada Firebase.</span></div><a id="openLiveProjector" href="live.html" target="_blank" rel="noreferrer">▣ Paparan Kelas Live</a>';
    if(head) head.after(bar); else dash.prepend(bar);
    const actions=dash.querySelector('.dashActions');
    if(actions&&!actions.querySelector('.liveProjectorBtn')){
      const a=document.createElement('a');a.className='liveProjectorBtn';a.target='_blank';a.rel='noreferrer';a.textContent='▣ Paparan Kelas';actions.prepend(a);
      const sync=()=>{const code=currentCode();const href='live.html'+(code?'?code='+encodeURIComponent(code):'');a.href=href;const top=document.querySelector('#openLiveProjector');if(top)top.href=href};
      sync();new MutationObserver(sync).observe(document.querySelector('#sessionLabel'),{childList:true,subtree:true,characterData:true});
    }
  }
  addEventListener('hashchange',()=>setTimeout(enhance,0));
  addEventListener('DOMContentLoaded',enhance);
  setTimeout(enhance,300);
})();
