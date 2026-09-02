"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export const DEFAULT_SESSION_CODE = "4821";

export type Pairing = {
  id: string;
  players: [string, string];
};

export type LiveMatch = {
  id: string;
  players: [string, string];
  scores: [number, number];
  turn: string;
  status: "waiting" | "playing" | "paused" | "finished";
  lastWord?: string;
  lastPoints?: number;
  lastPlayer?: string;
};

export type LiveSession = {
  started: boolean;
  paused: boolean;
};

export const CLASS_PAIRINGS: Pairing[] = [
  { id: "1", players: ["Aiman", "Harith"] },
  { id: "2", players: ["Firdaus", "Hilman"] },
  { id: "3", players: ["Irfan", "Faheem"] },
];

export function getPairingForPlayer(playerName: string): Pairing {
  const clean = playerName.trim();
  const known = CLASS_PAIRINGS.find((pairing) =>
    pairing.players.some((player) => player.toLowerCase() === clean.toLowerCase()),
  );
  if (known) return known;
  return {
    id: `open-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "player"}`,
    players: [clean || "Pemain", "Menunggu lawan"],
  };
}

function sessionRef(code: string) {
  if (!db) return null;
  return doc(db, "publicSessions", code);
}

function matchRef(code: string, matchId: string) {
  if (!db) return null;
  return doc(db, "publicSessions", code, "matches", matchId);
}

function toLiveMatch(id: string, data: DocumentData): LiveMatch {
  const players = Array.isArray(data.players) && data.players.length >= 2 ? data.players : ["Pemain 1", "Pemain 2"];
  const scores = Array.isArray(data.scores) && data.scores.length >= 2 ? data.scores : [0, 0];
  return {
    id,
    players: [String(players[0]), String(players[1])],
    scores: [Number(scores[0]) || 0, Number(scores[1]) || 0],
    turn: String(data.turn || players[0]),
    status: data.status === "finished" || data.status === "paused" || data.status === "playing" ? data.status : "waiting",
    lastWord: data.lastWord ? String(data.lastWord) : undefined,
    lastPoints: Number(data.lastPoints) || undefined,
    lastPlayer: data.lastPlayer ? String(data.lastPlayer) : undefined,
  };
}

export async function ensureLiveMatch(code: string, pairing: Pairing) {
  const ref = matchRef(code, pairing.id);
  if (!ref) return false;
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        players: pairing.players,
        scores: [0, 0],
        turn: pairing.players[0],
        status: "waiting",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, { players: pairing.players, updatedAt: serverTimestamp() }, { merge: true });
    }
    return true;
  } catch (error) {
    console.warn("Live match unavailable", error);
    return false;
  }
}

export function subscribeLiveMatch(
  code: string,
  matchId: string,
  onChange: (match: LiveMatch) => void,
  onError?: () => void,
): Unsubscribe {
  const ref = matchRef(code, matchId);
  if (!ref) {
    onError?.();
    return () => undefined;
  }
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) onChange(toLiveMatch(snap.id, snap.data()));
    },
    () => onError?.(),
  );
}

export function subscribeAllMatches(
  code: string,
  onChange: (matches: LiveMatch[]) => void,
  onError?: () => void,
): Unsubscribe {
  if (!db) {
    onError?.();
    return () => undefined;
  }
  return onSnapshot(
    collection(db, "publicSessions", code, "matches"),
    (snapshot) => {
      const matches = snapshot.docs.map((item) => toLiveMatch(item.id, item.data()));
      matches.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      onChange(matches);
    },
    () => onError?.(),
  );
}

export async function recordLiveScore(code: string, matchId: string, playerName: string, points: number, word: string) {
  const ref = matchRef(code, matchId);
  if (!ref) return false;
  try {
    await runTransaction(db!, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error("Match does not exist");
      const current = toLiveMatch(snap.id, snap.data());
      const playerIndex = current.players.findIndex(
        (player) => player.toLowerCase() === playerName.trim().toLowerCase(),
      );
      if (playerIndex < 0) throw new Error("Player is not part of this match");
      const opponentIndex = playerIndex === 0 ? 1 : 0;
      const nextScores: [number, number] = [...current.scores] as [number, number];
      nextScores[playerIndex] += points;
      transaction.set(
        ref,
        {
          scores: nextScores,
          turn: current.players[opponentIndex],
          status: "playing",
          lastWord: word,
          lastPoints: points,
          lastPlayer: current.players[playerIndex],
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
    return true;
  } catch (error) {
    console.warn("Unable to record live score", error);
    return false;
  }
}

export function subscribeSession(code: string, onChange: (session: LiveSession) => void): Unsubscribe {
  const ref = sessionRef(code);
  if (!ref) return () => undefined;
  return onSnapshot(ref, (snap) => {
    const data = snap.data() || {};
    onChange({ started: Boolean(data.started), paused: Boolean(data.paused) });
  });
}

export async function setSessionState(code: string, state: Partial<LiveSession>) {
  const ref = sessionRef(code);
  if (!ref) return false;
  try {
    await setDoc(ref, { ...state, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Unable to update live session", error);
    return false;
  }
}
