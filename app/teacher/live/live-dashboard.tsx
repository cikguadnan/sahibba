"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CLASS_PAIRINGS,
  DEFAULT_SESSION_CODE,
  subscribeAllMatches,
  subscribeSession,
  type LiveMatch,
} from "../../live-game";
import styles from "./live-dashboard.module.css";

function fallbackMatches(): LiveMatch[] {
  return CLASS_PAIRINGS.map((pairing)=>({
    id:pairing.id,
    players:pairing.players,
    scores:[0,0],
    turn:pairing.players[0],
    status:"waiting",
  }));
}

export default function LiveDashboard(){
  const [code,setCode]=useState(DEFAULT_SESSION_CODE);
  const [matches,setMatches]=useState<LiveMatch[]>(fallbackMatches());
  const [connected,setConnected]=useState(false);
  const [started,setStarted]=useState(false);
  const [paused,setPaused]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const next=params.get("code")?.replace(/\D/g,"").slice(0,4);
    if(next?.length===4)setCode(next);
  },[]);

  useEffect(()=>{
    const unsubscribeMatches=subscribeAllMatches(code,next=>{
      if(next.length)setMatches(next);
      setConnected(true);
    },()=>setConnected(false));
    const unsubscribeSession=subscribeSession(code,session=>{
      setStarted(session.started);
      setPaused(session.paused);
    });
    return()=>{unsubscribeMatches();unsubscribeSession()};
  },[code]);

  const totalPoints=useMemo(()=>matches.reduce((sum,m)=>sum+m.scores[0]+m.scores[1],0),[matches]);
  const leader=useMemo(()=>{
    const players=matches.flatMap(m=>[
      {name:m.players[0],score:m.scores[0]},
      {name:m.players[1],score:m.scores[1]},
    ]).filter(p=>p.name!=="Menunggu lawan");
    return players.sort((a,b)=>b.score-a.score)[0];
  },[matches]);

  const statusText=!started?"MENUNGGU":paused?"DIJEDA":"LANGSUNG";

  return <main className={styles.screen}>
    <header className={styles.top}>
      <div className={styles.brand}>SAHIBBA <span>CLASSROOM LIVE</span></div>
      <div className={styles.session}><small>KOD SESI</small><strong>{code}</strong></div>
      <div className={styles.live}><i className={styles.dot}/>{connected?statusText:"MENYAMBUNG"}</div>
    </header>

    <section className={styles.hero}>
      <h1>Papan Skor Kelas</h1>
      <p>Skor berubah secara langsung apabila perkataan diterima.</p>
    </section>

    <section className={styles.grid}>
      {matches.length?matches.map(match=><article className={styles.card} key={match.id}>
        <div className={styles.cardTop}><span className={styles.matchNo}>PERLAWANAN {match.id}</span><span className={styles.status}>{match.status==="playing"?"● BERMAIN":"MENUNGGU"}</span></div>
        <div className={styles.versus}>
          <div className={styles.player}><span>{match.players[0]}</span><strong>{match.scores[0]}</strong></div>
          <b className={styles.vs}>VS</b>
          <div className={styles.player}><span>{match.players[1]}</span><strong>{match.scores[1]}</strong></div>
        </div>
        <div className={styles.turn}>Giliran: {match.turn}</div>
        {match.lastWord&&<div className={styles.last}>Terkini: <b>{match.lastPlayer}</b> — “{match.lastWord}” +{match.lastPoints}</div>}
      </article>):<div className={styles.empty}>Belum ada perlawanan untuk dipaparkan.</div>}
    </section>

    <footer className={styles.footer}>
      <span>Jumlah mata kelas: <b>{totalPoints}</b></span>
      <span>Perlawanan: <b>{matches.length}</b></span>
      <span>Pendahulu: <b>{leader?`${leader.name} (${leader.score})`:"—"}</b></span>
    </footer>
    <a className={styles.back} href="/teacher">← Kembali ke dashboard guru</a>
  </main>;
}
