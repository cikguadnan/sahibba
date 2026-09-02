"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured, googleProvider } from "../firebase";
import {
  CLASS_PAIRINGS,
  DEFAULT_SESSION_CODE,
  ensureLiveMatch,
  setSessionState,
  subscribeAllMatches,
  subscribeSession,
  type LiveMatch,
} from "../live-game";
import styles from "./teacher-dashboard.module.css";

const TEACHER_EMAIL="mradnanmahmud@gmail.com";

function fallbackMatches(): LiveMatch[] {
  return CLASS_PAIRINGS.map((pairing)=>({
    id:pairing.id,
    players:pairing.players,
    scores:[0,0],
    turn:pairing.players[0],
    status:"waiting",
  }));
}

export default function TeacherDashboard() {
  const [user,setUser]=useState<User|null>(null);
  const [authReady,setAuthReady]=useState(false);
  const [authError,setAuthError]=useState("");
  const [matches,setMatches]=useState<LiveMatch[]>(fallbackMatches());
  const [started,setStarted]=useState(false);
  const [paused,setPaused]=useState(false);
  const [liveReady,setLiveReady]=useState(false);

  useEffect(()=>{
    if(!auth){setAuthReady(true);return}
    return onAuthStateChanged(auth,next=>{setUser(next);setAuthReady(true)});
  },[]);

  useEffect(()=>{
    if(!user||user.email?.toLowerCase()!==TEACHER_EMAIL)return;
    let active=true;
    Promise.all(CLASS_PAIRINGS.map(pairing=>ensureLiveMatch(DEFAULT_SESSION_CODE,pairing))).finally(()=>{
      if(active)setLiveReady(true);
    });
    const unsubscribeMatches=subscribeAllMatches(DEFAULT_SESSION_CODE,next=>{
      if(next.length)setMatches(next);
      setLiveReady(true);
    },()=>setLiveReady(false));
    const unsubscribeSession=subscribeSession(DEFAULT_SESSION_CODE,session=>{
      setStarted(session.started);
      setPaused(session.paused);
    });
    return()=>{active=false;unsubscribeMatches();unsubscribeSession()};
  },[user]);

  async function login(){
    if(!auth)return;
    setAuthError("");
    try{
      const result=await signInWithPopup(auth,googleProvider);
      if(result.user.email?.toLowerCase()!==TEACHER_EMAIL){
        await signOut(auth);
        setAuthError("Akaun Google ini tidak dibenarkan sebagai guru.");
      }
    }catch{
      setAuthError("Log masuk dibatalkan atau tidak berjaya. Sila cuba lagi.");
    }
  }

  async function toggleGame(){
    const nextStarted=!started;
    setStarted(nextStarted);
    setPaused(false);
    await setSessionState(DEFAULT_SESSION_CODE,{started:nextStarted,paused:false});
  }

  async function togglePause(){
    const next=!paused;
    setPaused(next);
    await setSessionState(DEFAULT_SESSION_CODE,{started:true,paused:next});
  }

  const totalPoints=useMemo(()=>matches.reduce((sum,m)=>sum+m.scores[0]+m.scores[1],0),[matches]);
  const activeMatches=matches.filter(m=>m.status==="playing").length;
  const joinedStudents=useMemo(()=>new Set(matches.flatMap(m=>m.players).filter(name=>name!=="Menunggu lawan")).size,[matches]);
  const recent=matches.filter(m=>m.lastWord).slice().reverse().slice(0,4);

  if(!authReady)return <main className={styles.loginStage}><div className={styles.loginCard}><h1>Memeriksa sesi...</h1></div></main>;
  if(!firebaseConfigured)return <main className={styles.loginStage}><div className={styles.loginCard}><p className={styles.eyebrow}>PENYEDIAAN DIPERLUKAN</p><h1>Sambungkan Firebase</h1><p>Masukkan tetapan Firebase dalam <b>.env.local</b> untuk mengaktifkan dashboard guru.</p><a className={styles.back} href="/">← Kembali ke laman utama</a></div></main>;
  if(!user||user.email?.toLowerCase()!==TEACHER_EMAIL)return <main className={styles.loginStage}><div className={styles.loginCard}><p className={styles.eyebrow}>KHAS UNTUK GURU</p><h1>Pusat Kawalan Sahibba</h1><p>Log masuk menggunakan akaun Google guru yang dibenarkan.</p><button className={styles.google} onClick={login}>G · Teruskan dengan Google</button>{authError&&<p className={styles.error}>{authError}</p>}<a className={styles.back} href="/">← Kembali ke laman utama</a></div></main>;

  const teacherName=user.displayName||"Cikgu Adnan";
  const gameStatus=!started?"Belum dimulakan":paused?"Dijeda":"Sedang berlangsung";

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <a className={styles.brand} href="/">SAHIBBA <span>CLASSROOM</span></a>
      <nav className={styles.nav}>
        <a className={styles.active} href="/teacher">⌂ Gambaran Keseluruhan</a>
        <a href="#matches">♟ Perlawanan Langsung</a>
        <a href="/teacher/live" target="_blank" rel="noreferrer">▣ Paparan Kelas</a>
        <button type="button">⚑ Semakan Perkataan</button>
        <button type="button">▦ Arkib & Laporan</button>
      </nav>
      <div className={styles.account}>
        <div className={styles.avatar}>G</div>
        <div className={styles.accountText}><b>{teacherName}</b><small>{user.email}</small></div>
        <button className={styles.logout} onClick={()=>auth&&signOut(auth)}>Log keluar</button>
      </div>
    </aside>

    <section className={styles.main}>
      <div className={styles.topbar}>
        <div><p className={styles.eyebrow}>PUSAT KAWALAN GURU</p><h1>Sahibba 3G1</h1><p className={styles.muted}>Pantau permainan, skor dan giliran dari satu tempat.</p></div>
        <div className={styles.actions}>
          <a className={styles.btnLive} href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer">▣ Buka Paparan Kelas</a>
          {started&&<button className={styles.btn} onClick={togglePause}>{paused?"▶ Sambung":"Ⅱ Jeda"}</button>}
          <button className={styles.btnPrimary} onClick={toggleGame}>{started?"Tamatkan Sesi":"Mulakan Permainan"}</button>
        </div>
      </div>

      <section className={styles.sessionHero}>
        <div>
          <div className={styles.sessionMeta}><span className={styles.liveDot}><i className={styles.dot}/> {liveReady?"DATA LANGSUNG":"MENYAMBUNG"}</span><span>{gameStatus}</span></div>
          <h2>{started&&!paused?"Kelas sedang bermain sekarang":"Sesi sedia untuk kelas"}</h2>
          <p>Skor pada paparan ini akan berubah secara automatik apabila murid mendapat mata.</p>
        </div>
        <div className={styles.codeWrap}><span className={styles.codeLabel}>KOD SESI</span><strong className={styles.code}>{DEFAULT_SESSION_CODE}</strong></div>
      </section>

      <div className={styles.metrics}>
        <article className={styles.metric}><span>MURID DALAM PADANAN</span><strong>{joinedStudents}</strong><small>{matches.length} perlawanan</small></article>
        <article className={styles.metric}><span>PERLAWANAN AKTIF</span><strong>{activeMatches}</strong><small>{gameStatus}</small></article>
        <article className={styles.metric}><span>JUMLAH MATA</span><strong>{totalPoints}</strong><small>Dikemas kini langsung</small></article>
        <article className={styles.metric}><span>AKTIVITI TERKINI</span><strong>{recent.length}</strong><small>Perkataan direkod</small></article>
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.panel} id="matches">
          <div className={styles.panelHead}><div><p className={styles.eyebrow}>PANTAUAN LANGSUNG</p><h2>Semua perlawanan</h2></div><span className={styles.statusPill}>● LIVE</span></div>
          <div className={styles.table}>
            <div className={styles.tableHeader}><span>PADANAN</span><span>SKOR</span><span>GILIRAN</span><span>STATUS</span></div>
            {matches.map(match=><a key={match.id} className={styles.matchRow} href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer">
              <span className={styles.players}><b>{match.players[0]} lwn {match.players[1]}</b><small>Perlawanan {match.id}</small></span>
              <strong className={styles.score}>{match.scores[0]}–{match.scores[1]}</strong>
              <span className={styles.turn}>{match.turn}</span>
              <span className={styles.matchStatus}>{match.status==="playing"?"● Bermain":match.status==="finished"?"Selesai":"Menunggu"}</span>
            </a>)}
          </div>
        </section>

        <aside className={styles.panel}>
          <div className={styles.panelHead}><div><p className={styles.eyebrow}>AKTIVITI</p><h2>Skor terkini</h2></div></div>
          <div className={styles.recent}>{recent.length?recent.map(match=><div className={styles.activity} key={match.id}><b>{match.lastPlayer} +{match.lastPoints} mata</b><span>“{match.lastWord}” · Perlawanan {match.id}</span></div>):<div className={styles.empty}>Belum ada perkataan dimainkan.</div>}</div>
          <div className={styles.quick}>
            <a href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer"><span>Paparan penuh untuk projektor</span><b>→</b></a>
            <a href="/"><span>Laman masuk murid</span><b>→</b></a>
          </div>
        </aside>
      </div>
    </section>
  </main>;
}
