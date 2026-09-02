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

const TEACHER_EMAIL = "mradnanmahmud@gmail.com";

function fallbackMatches(): LiveMatch[] {
  return CLASS_PAIRINGS.map((pairing) => ({
    id: pairing.id,
    players: pairing.players,
    scores: [0, 0],
    turn: pairing.players[0],
    status: "waiting",
  }));
}

function matchStatusLabel(match: LiveMatch) {
  if (match.status === "playing") return "Sedang bermain";
  if (match.status === "paused") return "Dijeda";
  if (match.status === "finished") return "Selesai";
  return "Menunggu";
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [matches, setMatches] = useState<LiveMatch[]>(fallbackMatches());
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [liveReady, setLiveReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [matchFilter, setMatchFilter] = useState<"all" | "playing" | "waiting">("all");

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== TEACHER_EMAIL) return;
    let active = true;

    Promise.all(CLASS_PAIRINGS.map((pairing) => ensureLiveMatch(DEFAULT_SESSION_CODE, pairing))).finally(() => {
      if (active) setLiveReady(true);
    });

    const unsubscribeMatches = subscribeAllMatches(
      DEFAULT_SESSION_CODE,
      (next) => {
        if (next.length) setMatches(next);
        setLiveReady(true);
      },
      () => setLiveReady(false),
    );

    const unsubscribeSession = subscribeSession(DEFAULT_SESSION_CODE, (session) => {
      setStarted(session.started);
      setPaused(session.paused);
    });

    return () => {
      active = false;
      unsubscribeMatches();
      unsubscribeSession();
    };
  }, [user]);

  async function login() {
    if (!auth) return;
    setAuthError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== TEACHER_EMAIL) {
        await signOut(auth);
        setAuthError("Akaun Google ini tidak dibenarkan sebagai guru.");
      }
    } catch {
      setAuthError("Log masuk dibatalkan atau tidak berjaya. Sila cuba lagi.");
    }
  }

  async function toggleGame() {
    const nextStarted = !started;
    setStarted(nextStarted);
    setPaused(false);
    await setSessionState(DEFAULT_SESSION_CODE, { started: nextStarted, paused: false });
  }

  async function togglePause() {
    const next = !paused;
    setPaused(next);
    await setSessionState(DEFAULT_SESSION_CODE, { started: true, paused: next });
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(DEFAULT_SESSION_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const totalPoints = useMemo(() => matches.reduce((sum, match) => sum + match.scores[0] + match.scores[1], 0), [matches]);
  const activeMatches = matches.filter((match) => match.status === "playing").length;
  const waitingMatches = matches.filter((match) => match.status === "waiting").length;
  const joinedStudents = useMemo(
    () => new Set(matches.flatMap((match) => match.players).filter((name) => name !== "Menunggu lawan")).size,
    [matches],
  );
  const recent = useMemo(() => matches.filter((match) => match.lastWord).slice().reverse().slice(0, 5), [matches]);
  const visibleMatches = matches.filter((match) => {
    if (matchFilter === "all") return true;
    return match.status === matchFilter;
  });

  const leader = useMemo(() => {
    const players = matches.flatMap((match) => [
      { name: match.players[0], score: match.scores[0] },
      { name: match.players[1], score: match.scores[1] },
    ]).filter((player) => player.name !== "Menunggu lawan");
    return players.sort((a, b) => b.score - a.score)[0];
  }, [matches]);

  if (!authReady) {
    return <main className={styles.loginStage}><div className={styles.loginCard}><h1>Memeriksa sesi...</h1></div></main>;
  }

  if (!firebaseConfigured) {
    return <main className={styles.loginStage}><div className={styles.loginCard}><p className={styles.eyebrow}>PENYEDIAAN DIPERLUKAN</p><h1>Sambungkan Firebase</h1><p>Masukkan tetapan Firebase dalam <b>.env.local</b> untuk mengaktifkan dashboard guru.</p><a className={styles.back} href="/">← Kembali ke laman utama</a></div></main>;
  }

  if (!user || user.email?.toLowerCase() !== TEACHER_EMAIL) {
    return <main className={styles.loginStage}><div className={styles.loginCard}><div className={styles.loginLogo}>S</div><p className={styles.eyebrow}>KHAS UNTUK GURU</p><h1>Pusat Kawalan Sahibba</h1><p>Log masuk menggunakan akaun Google guru yang dibenarkan.</p><button className={styles.google} onClick={login}>G · Teruskan dengan Google</button>{authError && <p className={styles.error}>{authError}</p>}<a className={styles.back} href="/">← Kembali ke laman utama</a></div></main>;
  }

  const teacherName = user.displayName || "Cikgu Adnan";
  const gameStatus = !started ? "Belum dimulakan" : paused ? "Dijeda" : "Sedang berlangsung";
  const sessionTone = !started ? styles.statusIdle : paused ? styles.statusPaused : styles.statusPlaying;

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.sideTop}>
        <a className={styles.brand} href="/"><span className={styles.brandMark}>S</span><span className={styles.brandText}>SAHIBBA<small>TEACHER</small></span></a>
        <nav className={styles.nav}>
          <a className={styles.active} href="/teacher"><span>⌂</span> Dashboard</a>
          <a href="#matches"><span>◫</span> Perlawanan Langsung</a>
          <a href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer"><span>▣</span> Paparan Kelas</a>
        </nav>
        <div className={styles.navGroupLabel}>PENGURUSAN</div>
        <nav className={styles.navSecondary}>
          <button type="button" disabled><span>✓</span> Semakan Perkataan <em>Akan datang</em></button>
          <button type="button" disabled><span>▦</span> Arkib & Laporan <em>Akan datang</em></button>
        </nav>
      </div>

      <div className={styles.account}>
        <div className={styles.avatar}>{teacherName.charAt(0).toUpperCase()}</div>
        <div className={styles.accountText}><b>{teacherName}</b><small>{user.email}</small></div>
        <button className={styles.logout} onClick={() => auth && signOut(auth)}>Log keluar</button>
      </div>
    </aside>

    <section className={styles.main}>
      <header className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>SELAMAT DATANG, CIKGU</p>
          <h1>Dashboard Permainan</h1>
          <p className={styles.muted}>Kawal sesi, pantau skor dan lihat aktiviti murid secara langsung.</p>
        </div>
        <div className={styles.topActions}>
          <a className={styles.btnGhost} href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer">▣ Paparan Kelas</a>
          <button className={styles.btnPrimary} onClick={toggleGame}>{started ? "Tamatkan Permainan" : "Mulakan Permainan"}</button>
        </div>
      </header>

      <section className={styles.sessionCard}>
        <div className={styles.sessionInfo}>
          <div className={styles.sessionHeadingRow}>
            <div>
              <div className={`${styles.sessionStatus} ${sessionTone}`}><i />{gameStatus}</div>
              <h2>Sahibba 3G1</h2>
              <p>Sesi aktif untuk permainan kelas hari ini.</p>
            </div>
            <div className={styles.liveConnection}><i className={liveReady ? styles.connected : styles.connecting} />{liveReady ? "Firebase disambungkan" : "Menyambung data..."}</div>
          </div>
          <div className={styles.sessionControls}>
            {started && <button className={styles.controlButton} onClick={togglePause}>{paused ? "▶ Sambung permainan" : "Ⅱ Jeda permainan"}</button>}
            <a className={styles.controlButton} href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer">Buka skrin projektor ↗</a>
          </div>
        </div>

        <div className={styles.joinCard}>
          <span>KOD PERMAINAN</span>
          <strong>{DEFAULT_SESSION_CODE}</strong>
          <button onClick={copyCode}>{copied ? "✓ Kod disalin" : "Salin kod"}</button>
          <small>Murid gunakan kod ini untuk masuk.</small>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}><div className={styles.statIcon}>♟</div><div><span>MURID</span><strong>{joinedStudents}</strong><small>Dalam {matches.length} padanan</small></div></article>
        <article className={styles.statCard}><div className={styles.statIcon}>●</div><div><span>AKTIF</span><strong>{activeMatches}</strong><small>{waitingMatches} menunggu</small></div></article>
        <article className={styles.statCard}><div className={styles.statIcon}>★</div><div><span>JUMLAH MATA</span><strong>{totalPoints}</strong><small>Dikemas kini langsung</small></div></article>
        <article className={styles.statCard}><div className={styles.statIcon}>↑</div><div><span>TERTINGGI</span><strong>{leader?.score ?? 0}</strong><small>{leader?.name || "Belum ada skor"}</small></div></article>
      </section>

      <section className={styles.dashboardGrid}>
        <div className={styles.panel} id="matches">
          <div className={styles.panelHeader}>
            <div><p className={styles.eyebrow}>PERLAWANAN LANGSUNG</p><h2>Pantauan kelas</h2></div>
            <div className={styles.filters}>
              <button className={matchFilter === "all" ? styles.filterActive : ""} onClick={() => setMatchFilter("all")}>Semua</button>
              <button className={matchFilter === "playing" ? styles.filterActive : ""} onClick={() => setMatchFilter("playing")}>Aktif</button>
              <button className={matchFilter === "waiting" ? styles.filterActive : ""} onClick={() => setMatchFilter("waiting")}>Menunggu</button>
            </div>
          </div>

          <div className={styles.matchList}>
            {visibleMatches.map((match) => {
              const total = match.scores[0] + match.scores[1];
              const firstLead = match.scores[0] >= match.scores[1];
              return <article className={styles.matchCard} key={match.id}>
                <div className={styles.matchTopline}><span>PADANAN {match.id}</span><span className={`${styles.matchBadge} ${match.status === "playing" ? styles.badgePlaying : ""}`}>{matchStatusLabel(match)}</span></div>
                <div className={styles.scoreBoard}>
                  <div className={styles.playerBlock}><b>{match.players[0]}</b><strong className={firstLead && total > 0 ? styles.leadingScore : ""}>{match.scores[0]}</strong></div>
                  <div className={styles.versus}>VS</div>
                  <div className={styles.playerBlock}><b>{match.players[1]}</b><strong className={!firstLead && total > 0 ? styles.leadingScore : ""}>{match.scores[1]}</strong></div>
                </div>
                <div className={styles.matchFooter}><span>Giliran: <b>{match.turn}</b></span>{match.lastWord ? <span>Terakhir: <b>{match.lastWord}</b> +{match.lastPoints}</span> : <span>Belum ada perkataan</span>}</div>
              </article>;
            })}
            {!visibleMatches.length && <div className={styles.empty}>Tiada perlawanan dalam kategori ini.</div>}
          </div>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><p className={styles.eyebrow}>AKTIVITI TERKINI</p><h2>Skor & perkataan</h2></div><span className={styles.liveLabel}>● LIVE</span></div>
            <div className={styles.activityList}>
              {recent.length ? recent.map((match) => <div className={styles.activityItem} key={match.id}>
                <div className={styles.activityAvatar}>{match.lastPlayer?.charAt(0) || "S"}</div>
                <div><b>{match.lastPlayer}</b><span>memainkan “{match.lastWord}”</span><small>Padanan {match.id}</small></div>
                <strong>+{match.lastPoints}</strong>
              </div>) : <div className={styles.empty}>Aktiviti akan muncul apabila permainan bermula.</div>}
            </div>
          </section>

          <section className={styles.quickPanel}>
            <p className={styles.eyebrow}>AKSES PANTAS</p>
            <h2>Alat untuk kelas</h2>
            <a href={`/teacher/live?code=${DEFAULT_SESSION_CODE}`} target="_blank" rel="noreferrer"><span><b>▣ Paparan Kelas</b><small>Skor besar untuk projektor</small></span><strong>→</strong></a>
            <button type="button" onClick={copyCode}><span><b>⌘ Salin Kod Sesi</b><small>Kongsi kod {DEFAULT_SESSION_CODE} dengan murid</small></span><strong>{copied ? "✓" : "→"}</strong></button>
            <a href="/"><span><b>↗ Laman Murid</b><small>Semak pengalaman masuk permainan</small></span><strong>→</strong></a>
          </section>
        </aside>
      </section>
    </section>
  </main>;
}
