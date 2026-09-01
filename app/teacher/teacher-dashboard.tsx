"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured, googleProvider } from "../firebase";

const initialMatches = [
  {id:1,a:"Aiman",b:"Harith",as:34,bs:28,turn:"Harith",status:"Bermain"},
  {id:2,a:"Firdaus",b:"Hilman",as:41,bs:19,turn:"Hilman",status:"Bermain"},
  {id:3,a:"Irfan",b:"Faheem",as:22,bs:22,turn:"Irfan",status:"Bermain"},
];

const TEACHER_EMAIL="mradnanmahmud@gmail.com";
export default function TeacherDashboard() {
  const [user,setUser]=useState<User|null>(null),[authReady,setAuthReady]=useState(false),[authError,setAuthError]=useState("");
  const [started,setStarted]=useState(false), [challenge,setChallenge]=useState<"pending"|"approved"|"rejected">("pending"), [selected,setSelected]=useState(1);
  useEffect(()=>{if(!auth){setAuthReady(true);return}return onAuthStateChanged(auth,next=>{setUser(next);setAuthReady(true)})},[]);
  async function login(){if(!auth)return;setAuthError("");try{const result=await signInWithPopup(auth,googleProvider);if(result.user.email?.toLowerCase()!==TEACHER_EMAIL){await signOut(auth);setAuthError("Akaun Google ini tidak dibenarkan sebagai guru.")}}catch{setAuthError("Log masuk dibatalkan atau tidak berjaya. Sila cuba lagi.")}}
  if(!authReady)return <main className="loginStage"><div className="googleCard"><span className="pulse"/><h1>Memeriksa sesi...</h1></div></main>;
  if(!firebaseConfigured)return <main className="loginStage"><div className="googleCard"><div className="googleMark">G</div><p className="eyebrow">PENYEDIAAN DIPERLUKAN</p><h1>Sambungkan Firebase</h1><p>Masukkan tetapan Firebase dalam fail <b>.env.local</b> untuk mengaktifkan log masuk Google.</p><a className="primary loginButton" href="/">Kembali ke laman utama</a></div></main>;
  if(!user||user.email?.toLowerCase()!==TEACHER_EMAIL)return <main className="loginStage"><div className="googleCard"><div className="googleMark">G</div><p className="eyebrow">KHAS UNTUK GURU</p><h1>Log masuk ke Pusat Kawalan</h1><p>Gunakan akaun Google guru yang telah dibenarkan. Murid tidak memerlukan akaun.</p><button className="googleButton" onClick={login}><b>G</b> Teruskan dengan Google</button>{authError&&<p className="authError">{authError}</p>}<a className="backHome" href="/">← Kembali ke laman utama</a></div></main>;
  const teacherName=user.displayName||"Cikgu Adnan";
  return <main className="teacherShell">
    <aside className="sideNav"><a className="smallBrand" href="/">SAHIBBA <span>CLASSROOM</span></a><nav><b>⌂ Gambaran Keseluruhan</b><span>♟ Perlawanan</span><span>📖 Kamus Kelas</span><span>⚑ Semakan Perkataan</span><span>▦ Laporan</span></nav><div className="teacherUser"><div>G</div><span><b>{teacherName}</b><small>{user.email}</small></span><button onClick={()=>auth&&signOut(auth)}>Keluar</button></div></aside>
    <section className="dashboard"><div className="dashHead"><div><p className="eyebrow">PUSAT KAWALAN GURU</p><h1>Sahibba 3G1</h1><p>Selasa, 1 September · Sesi 4821</p></div><div className="dashActions"><button className="outlineBtn">Paparkan Kod Besar</button><button className="primary compact" onClick={()=>setStarted(!started)}>{started?"Jeda Permainan":"Mulakan Padanan"}</button></div></div>
      <div className="metricGrid"><article><span>MURID MASUK</span><strong>6<small>/6</small></strong><em>✓ Semua bersedia</em></article><article><span>PERLAWANAN</span><strong>3</strong><em>{started?"● Sedang berlangsung":"◷ Belum dimulakan"}</em></article><article><span>PERKATAAN SAH</span><strong>12</strong><em>Purata 4 setiap permainan</em></article><article className="attention"><span>PERLU SEMAKAN</span><strong>{challenge==="pending"?1:0}</strong><em>{challenge==="pending"?"Tindakan diperlukan":"Semua selesai"}</em></article></div>
      <div className="dashboardGrid"><section className="panel matches"><div className="panelHead"><div><p className="eyebrow">PANTAUAN LANGSUNG</p><h2>Semua perlawanan</h2></div><span className="live">● LANGSUNG</span></div><div className="matchTable"><div className="tableHead"><span>PADANAN</span><span>SKOR</span><span>GILIRAN</span><span>STATUS</span></div>{initialMatches.map(m=><button key={m.id} className={selected===m.id?"selected":""} onClick={()=>setSelected(m.id)}><span><b>{m.a}</b> lwn {m.b}</span><strong>{m.as}–{m.bs}</strong><span>{m.turn}</span><em>{started?"● Bermain":"◷ Menunggu"}</em></button>)}</div><button className="viewBoard">Lihat papan Perlawanan {selected} →</button></section>
        <aside className="panel review"><div className="panelHead"><div><p className="eyebrow">SEMAKAN</p><h2>Cabaran perkataan</h2></div><span className="count">{challenge==="pending"?1:0}</span></div>{challenge==="pending"?<div className="wordReview"><small>PERLAWANAN 2 · FIRDAUS</small><strong>“MENGGAMIT”</strong><p>Perkataan ini tidak ditemui dalam kamus semasa.</p><div><button onClick={()=>setChallenge("rejected")}>Tolak</button><button onClick={()=>setChallenge("approved")}>✓ Terima</button></div><label><input type="checkbox" defaultChecked/> Tambah ke Kamus Kelas</label></div>:<div className="emptyReview"><b>✓</b><p>Semua cabaran telah disemak.</p><button onClick={()=>setChallenge("pending")}>Pulihkan demo</button></div>}</aside>
      </div>
      <section className="dictionaryStrip"><div><p className="eyebrow">ENJIN PERKATAAN</p><h2>Kamus Sahibba Kelas</h2><p>Perkataan yang cikgu luluskan boleh ditambah terus untuk permainan seterusnya.</p></div><div><strong>3,248</strong><span>perkataan aktif</span></div><button className="outlineBtn">Urus Kamus →</button></section>
    </section>
  </main>;
}
