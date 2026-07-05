"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMeetingById, getCurrentUser, joinMeeting, type Meeting, type User } from "@/lib/api";
import { copyToClipboard } from "@/lib/format";
import Logo from "@/components/Logo";
import {
  Copy, Check, Settings, AlertCircle,
  MessageSquare, X, Mic, MicOff,
  Video as VideoIcon, VideoOff,
  Monitor, PhoneOff, Send, Users,
  MoreVertical, Maximize2, MicOff as MicOffIcon,
  VideoOff as CameraOffIcon, Link as LinkIcon,
  ChevronRight, Shield, Volume2, Sliders, QrCode
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Spinner from "@/components/Spinner";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  GridLayout,
  ParticipantTile,
  DisconnectButton,
  useLocalParticipant,
  useChat,
  useParticipants,
  useTrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

// ---------------------------------------------------------------------------
// ROOT PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function MeetingRoom() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        if (!user) { router.push("/login"); return; }
        setCurrentUser(user);
        
        const m = await getMeetingById(id);
        if (!m) { setTokenError("Meeting not found"); setLoading(false); return; }
        setMeeting(m);
        
        // 1. Join meeting (adds to DB participants, determines role)
        const role = await joinMeeting(m.id, user.id);
        
        // 2. Fetch LiveKit token using the verified role
        const res = await fetch(`/api/livekit?room=${m.id}&username=${encodeURIComponent(user.name)}&role=${role}`);
        const data = await res.json();
        
        if (!res.ok) { 
          if (data.waiting) {
            setIsWaiting(true);
          } else {
            throw new Error(data.error || "Failed to get token");
          }
        } else {
          setToken(data.token);
        }
      } catch (err: any) {
        setTokenError(err.message || "Failed to generate connection token.");
      }
      setLoading(false);
    }
    load();

    // Poll if waiting
    let interval: ReturnType<typeof setInterval>;
    if (isWaiting) {
      interval = setInterval(() => {
        load();
      }, 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [id, router, isWaiting]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function copyLink() {
    const success = await copyToClipboard(`${window.location.origin}/meeting/${id}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading || !currentUser) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl animate-pulse">
          <Spinner className="w-7 h-7 text-brand" />
        </div>
        <p className="text-sm font-bold text-white/30 tracking-[0.2em] uppercase">Preparing your room</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden" data-lk-theme="default">

      {/* ── TOPBAR: always on top, even over screen share ── */}
      <header className="h-14 flex items-center justify-between px-5 shrink-0 z-50 relative bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <Logo size="sm" onDark />
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white truncate max-w-[220px] leading-none">{meeting?.title || "Meeting"}</p>
            <p className="text-xs text-white/40 mt-0.5 font-mono">{fmt(elapsed)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQr(true)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            title="Show QR Code"
          >
            <QrCode size={15} />
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 text-xs font-bold text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-4 py-2 rounded-full transition-all"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? "Copied!" : (meeting?.code || id)}
          </button>
          <Link href="/settings" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <Settings size={16} />
          </Link>
        </div>
      </header>

      {/* ── QR CODE POPUP ── */}
      {showQr && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowQr(false)}>
          <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/10 shadow-2xl transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-4 text-center">Scan to Join</h3>
            <div className="bg-white p-4 rounded-xl flex items-center justify-center">
              {meeting && <QRCodeSVG value={`${window.location.origin}/meeting/${meeting.code || id}`} size={200} />}
            </div>
            <button onClick={() => setShowQr(false)} className="w-full mt-4 py-2.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 relative overflow-hidden">
        {isWaiting ? (
          <WaitingState />
        ) : tokenError ? (
          <ErrorState error={tokenError} />
        ) : token ? (
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={() => router.push("/dashboard")}
            className="w-full h-full"
          >
            <IntelligentLayout currentUser={currentUser} meeting={meeting!} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 animate-pulse">
              <Spinner className="w-6 h-6 text-brand" />
            </div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/30">Connecting to secure room</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WAITING ROOM STATE
// ---------------------------------------------------------------------------
function WaitingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="max-w-md w-full bg-[#111] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
        <div className="w-20 h-20 mx-auto bg-brand/10 text-brand flex items-center justify-center rounded-full mb-6 relative">
          <Shield size={32} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand border border-[#111]"></span>
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Waiting for Host</h2>
        <p className="text-sm text-white/50 font-medium leading-relaxed mb-6">
          This meeting requires host approval to join. Please wait here, you will be admitted automatically.
        </p>
        <div className="flex items-center gap-3 justify-center text-xs font-bold text-white/40 bg-white/5 p-3 rounded-xl">
          <Spinner className="w-4 h-4 text-brand" />
          <span className="tracking-widest uppercase">Checking status...</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ERROR STATE
// ---------------------------------------------------------------------------
function ErrorState({ error }: { error: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 flex items-center justify-center rounded-2xl mx-auto mb-5">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
        <p className="text-sm text-white/50 mb-6">{error}</p>
        <Link href="/dashboard" className="inline-block w-full text-center bg-brand text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INTELLIGENT LAYOUT — the brain of the meeting room
// ---------------------------------------------------------------------------
type Panel = "chat" | "people" | "more" | null;

function IntelligentLayout({ currentUser, meeting }: { currentUser: User; meeting: Meeting }) {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [barVisible, setBarVisible] = useState(true);
  const barTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // LiveKit hooks
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const screenShareTracks = tracks.filter(t => t.source === Track.Source.ScreenShare);
  const cameraTracks      = tracks.filter(t => t.source === Track.Source.Camera);
  const hasScreenShare    = screenShareTracks.length > 0;
  const participantCount  = participants.length;

  // Toggle a panel — opening one always closes the others
  const togglePanel = (p: Panel) => setActivePanel(prev => prev === p ? null : p);

  // Close More menu when clicking outside
  useEffect(() => {
    if (activePanel !== "more") return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePanel]);

  // Auto-hide bar on mouse inactivity (only during screen share)
  const resetBarTimer = useCallback(() => {
    setBarVisible(true);
    if (barTimerRef.current) clearTimeout(barTimerRef.current);
    if (hasScreenShare) {
      barTimerRef.current = setTimeout(() => setBarVisible(false), 4000);
    }
  }, [hasScreenShare]);

  useEffect(() => {
    if (!hasScreenShare) {
      setBarVisible(true);
      if (barTimerRef.current) clearTimeout(barTimerRef.current);
    } else {
      resetBarTimer();
    }
    return () => { if (barTimerRef.current) clearTimeout(barTimerRef.current); };
  }, [hasScreenShare, resetBarTimer]);

  // Calculate grid columns for camera tiles based on participant count
  const gridCols = participantCount <= 1 ? 1 : participantCount <= 4 ? 2 : participantCount <= 9 ? 3 : 4;

  const sidebarOpen = activePanel === "chat" || activePanel === "people";

  return (
    <div
      className="relative flex h-full w-full overflow-hidden bg-[#0A0A0A]"
      onMouseMove={resetBarTimer}
      onTouchStart={resetBarTimer}
    >

      {/* ── VIDEO AREA — exact width, no phantom padding ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <div className="flex-1 min-h-0 p-3 pb-[88px]">
          {hasScreenShare ? (
            // ── SCREEN SHARE LAYOUT ──
            <div className="flex gap-3 h-full w-full">
              {/* Main screen share */}
              <div className="flex-1 min-w-0 h-full relative bg-[#111] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <ParticipantTile trackRef={screenShareTracks[0]} className="w-full h-full" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Monitor size={12} className="text-brand" />
                  {screenShareTracks[0]?.participant?.name || "Presenter"}&apos;s Screen
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <Maximize2 size={13} />
                </button>
              </div>
              {/* Camera sidebar */}
              {cameraTracks.length > 0 && (
                <div className="w-[168px] shrink-0 h-full flex flex-col gap-2 overflow-y-auto scrollbar-thin pr-0.5">
                  {cameraTracks.map((track, i) => (
                    <div key={i} className="w-full aspect-video bg-[#111] rounded-xl overflow-hidden border border-white/5 shadow-lg relative shrink-0">
                      <ParticipantTile trackRef={track} className="w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ── CAMERA GRID LAYOUT ──
            <div className="w-full h-full">
              <GridLayout
                tracks={cameraTracks}
                className="h-full w-full"
                style={{ "--lk-grid-gap": "12px", "--lk-col-count": gridCols } as React.CSSProperties}
              >
                <ParticipantTile className="!rounded-2xl !border !border-white/5 !shadow-xl !bg-[#151515] transition-all duration-300" />
              </GridLayout>
            </div>
          )}
        </div>
      </div>

      {/* ── SIDE PANEL (Chat / People) ── */}
      <div
        className="shrink-0 h-full flex flex-col bg-[#0f0f0f] border-l border-white/5 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: sidebarOpen ? 340 : 0 }}
      >
        {/* Chat Panel */}
        <div style={{ display: activePanel === 'chat' ? 'flex' : 'none' }} className="flex-col h-full w-full flex-1">
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 shrink-0 bg-white/3">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-brand" />
              <span className="text-sm font-bold text-white">Meeting Chat</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <CustomChat />
          </div>
        </div>

        {/* People Panel */}
        <div style={{ display: activePanel === 'people' ? 'flex' : 'none' }} className="flex-col h-full w-full flex-1">
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 shrink-0 bg-white/3">
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-brand" />
              <span className="text-sm font-bold text-white">Participants</span>
              <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-0.5 rounded-full">{participantCount}</span>
            </div>
            <button onClick={() => setActivePanel(null)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {/* Active Participants */}
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 px-3 pt-2">In Meeting</div>
            {meeting.participants?.filter(p => (p as any).role !== 'waiting').map((dbUser) => {
              // Find matching LiveKit participant
              const p = participants.find(lkP => lkP.identity === dbUser.name);
              const role = (dbUser as any).role;
              const isHost = role === 'host';
              const isMod = role === 'moderator';
              const isCamOn = p ? p.isCameraEnabled : false;
              const isMicOn = p ? p.isMicrophoneEnabled : false;
              
              return (
                <div key={dbUser.id} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-2 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {(dbUser.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {dbUser.name}
                        {dbUser.id === currentUser.id && <span className="text-[10px] text-white/40 font-normal">(You)</span>}
                        {isHost && <Shield size={10} className="text-brand" />}
                        {isMod && <Shield size={10} className="text-blue-400" />}
                      </p>
                      <p className="text-[11px] text-white/30 capitalize">{role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Host Controls for Participant */}
                    {meeting.host_id === currentUser.id && dbUser.id !== currentUser.id && (
                      <button
                        onClick={async () => {
                          const { updateParticipantRole } = await import("@/lib/api");
                          await updateParticipantRole(meeting.id, dbUser.id, isMod ? 'participant' : 'moderator');
                          if (p) {
                            await fetch('/api/livekit/admin', {
                              method: 'POST',
                              body: JSON.stringify({ action: 'update-role', room: meeting.id, identity: p.identity, role: isMod ? 'participant' : 'moderator' })
                            });
                          }
                          // Local mutation for instant feedback
                          (dbUser as any).role = isMod ? 'participant' : 'moderator';
                        }}
                        className="opacity-0 group-hover/item:opacity-100 px-2 py-1 mr-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded transition-all"
                      >
                        {isMod ? "Remove Mod" : "Make Mod"}
                      </button>
                    )}
                    
                    {p && (
                      <>
                        <button
                          title={isMicOn ? "Mute Participant" : "Mic Off"}
                          onClick={async () => {
                            if (!isMicOn) return;
                            const audioTracks = Array.from(p.audioTrackPublications.values());
                            const trackSid = audioTracks[0]?.trackSid;
                            if (trackSid) {
                              await fetch('/api/livekit/admin', {
                                method: 'POST',
                                body: JSON.stringify({ action: 'mute', room: meeting.id, identity: p.identity, trackSid })
                              });
                            }
                          }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isMicOn ? "hover:bg-white/10 text-white/50 hover:text-white cursor-pointer" : "bg-red-500/20 text-red-400 cursor-default"}`}
                        >
                          {isMicOn ? <Mic size={12} /> : <MicOff size={12} />}
                        </button>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCamOn ? "text-white/50" : "bg-red-500/20 text-red-400"}`}>
                          {isCamOn ? <VideoIcon size={12} /> : <VideoOff size={12} />}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Waiting Room Section (Only visible to hosts/moderators) */}
            {(currentUser.role === 'host' || meeting.host_id === currentUser.id || meeting.participants?.find(p => p.id === currentUser.id && (p as any).role === 'moderator')) && meeting.participants?.some(p => (p as any).role === 'waiting') && (
              <>
                <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2 px-3 pt-4 flex items-center gap-2">
                  <AlertCircle size={14} /> Waiting Room
                </div>
                {meeting.participants.filter(p => (p as any).role === 'waiting').map((dbUser) => (
                  <div key={dbUser.id} className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-brand/5 border border-brand/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-white text-xs font-black shrink-0 border border-white/10">
                        {(dbUser.name || "?")[0].toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-white truncate">{dbUser.name}</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          const { updateParticipantRole } = await import("@/lib/api");
                          await updateParticipantRole(meeting.id, dbUser.id, 'participant');
                          (dbUser as any).role = 'participant'; // local mutation
                          btn.closest('.flex-col')?.remove(); // hide item
                        }}
                        className="flex-1 bg-brand text-white font-bold py-1.5 rounded-lg text-xs hover:bg-brand-hover disabled:opacity-50"
                      >
                        Admit
                      </button>
                      <button 
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          const { removeParticipant } = await import("@/lib/api");
                          await removeParticipant(meeting.id, dbUser.id);
                          btn.closest('.flex-col')?.remove(); // hide item
                        }}
                        className="px-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 font-bold py-1.5 rounded-lg text-xs disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </>
              )}
            </div>
          </div>
      </div>

      {/* ── MORE MENU — floating popup above the More button ── */}
      {activePanel === "more" && (
        <div
          ref={moreRef}
          className="absolute bottom-24 right-6 z-50 w-56 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Room Options</p>
          </div>
          {[
            { icon: <Sliders size={15} />,   label: "Audio & Video Settings" },
            { icon: <Volume2 size={15} />,   label: "Speaker View" },
            { icon: <Shield size={15} />,    label: "Security" },
            { icon: <LinkIcon size={15} />,  label: "Copy Invite Link" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActivePanel(null)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
            >
              <span className="text-white/40">{item.icon}</span>
              {item.label}
              <ChevronRight size={13} className="ml-auto text-white/20" />
            </button>
          ))}
          <div className="p-2 border-t border-white/5">
            {meeting.host_id === currentUser.id && (
              <button
                onClick={async () => {
                  setActivePanel(null);
                  if (confirm("Are you sure you want to end this meeting for everyone?")) {
                    const { updateMeetingStatus } = await import("@/lib/api");
                    await updateMeetingStatus(meeting.id, 'ended');
                    await fetch('/api/livekit/admin', {
                      method: 'POST',
                      body: JSON.stringify({ action: 'end', room: meeting.id })
                    });
                    // The disconnect handler will push to /dashboard
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left"
              >
                <PhoneOff size={14} />
                End for Everyone
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── PARTICIPANT COUNT BADGE ── */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white/70 text-xs font-bold">{participantCount} in room</span>
      </div>

      {/* ── CONTROL BAR ── */}
      <div
        className={`absolute bottom-0 left-0 z-50 flex items-end justify-center pb-5 transition-all duration-500 ${
          hasScreenShare && !barVisible ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
        }`}
        style={{ right: sidebarOpen ? 340 : 0 }}
      >
        <ControlBar
          activePanel={activePanel}
          togglePanel={togglePanel}
        />
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTROL BAR — uses useTrackToggle hook for correct custom button styling
// ---------------------------------------------------------------------------
function ControlBar({
  activePanel,
  togglePanel,
}: {
  activePanel: Panel;
  togglePanel: (p: Panel) => void;
}) {
  const { chatMessages } = useChat();
  const [prevCount, setPrevCount] = useState(0);
  const [badge, setBadge] = useState(0);

  const mic   = useTrackToggle({ source: Track.Source.Microphone });
  const cam   = useTrackToggle({ source: Track.Source.Camera });
  const share = useTrackToggle({ source: Track.Source.ScreenShare });

  useEffect(() => {
    const count = chatMessages.length;
    if (activePanel !== "chat" && count > prevCount) setBadge(b => b + (count - prevCount));
    setPrevCount(count);
  }, [chatMessages.length, activePanel, prevCount]);

  useEffect(() => { if (activePanel === "chat") setBadge(0); }, [activePanel]);

  return (
    <div className="flex items-center gap-1 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-3 py-3 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">

      {/* ── MIC ── */}
      <ControlBtn label="Mic" danger={!mic.enabled} icon={mic.enabled ? <Mic size={19} /> : <MicOff size={19} />} buttonProps={mic.buttonProps} />

      {/* ── CAMERA ── */}
      <ControlBtn label="Camera" danger={!cam.enabled} icon={cam.enabled ? <VideoIcon size={19} /> : <VideoOff size={19} />} buttonProps={cam.buttonProps} />

      <Divider />

      {/* ── SCREEN SHARE ── */}
      <ControlBtn label={share.enabled ? "Stop" : "Share"} accent={share.enabled} icon={<Monitor size={19} />} buttonProps={share.buttonProps} />

      <Divider />

      {/* ── CHAT ── */}
      <div className="relative">
        <ControlBtn
          label="Chat"
          accent={activePanel === "chat"}
          icon={<MessageSquare size={19} />}
          onClick={() => togglePanel("chat")}
        />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full text-white text-[9px] font-black flex items-center justify-center border border-[#1c1c1e] animate-pulse pointer-events-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      {/* ── PEOPLE ── */}
      <ControlBtn
        label="People"
        accent={activePanel === "people"}
        icon={<Users size={19} />}
        onClick={() => togglePanel("people")}
      />

      {/* ── MORE ── */}
      <ControlBtn
        label="More"
        accent={activePanel === "more"}
        icon={<MoreVertical size={19} />}
        onClick={() => togglePanel("more")}
      />

      <Divider />

      {/* ── LEAVE ── */}
      <DisconnectButton>
        <div className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 h-11 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(239,68,68,0.45)] hover:scale-105 text-[13px] cursor-pointer select-none">
          <PhoneOff size={16} strokeWidth={2.5} />
          Leave
        </div>
      </DisconnectButton>

    </div>
  );
}

// ── Atom: single control button ──
function ControlBtn({
  label, icon, danger = false, accent = false, onClick, buttonProps,
}: {
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
  accent?: boolean;
  onClick?: () => void;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <button
      {...(buttonProps ?? {})}
      onClick={buttonProps?.onClick ?? onClick}
      title={label}
      className="group flex flex-col items-center gap-1 px-2 focus:outline-none"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${
        danger  ? "bg-red-500/20 text-red-400 group-hover:bg-red-500/30" :
        accent  ? "bg-brand/20 text-brand group-hover:bg-brand/30" :
                  "bg-white/8 text-white/70 group-hover:bg-white/16 group-hover:text-white"
      }`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-white/30 group-hover:text-white/60 transition-colors leading-none">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/8 mx-1.5 self-center" />;
}


// ---------------------------------------------------------------------------
// CUSTOM CHAT ENGINE
// ---------------------------------------------------------------------------
function CustomChat() {
  const { send, chatMessages, isSending } = useChat();
  const { localParticipant } = useLocalParticipant();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && !isSending) {
      send(trimmed);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <MessageSquare size={20} className="text-white/20" />
            </div>
            <p className="text-sm font-semibold text-white/30">No messages yet</p>
            <p className="text-xs text-white/20 mt-1">Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg, i) => {
            const isLocal = msg.from?.identity === localParticipant.identity;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={msg.id || i} className={`flex flex-col gap-1 ${isLocal ? "items-end" : "items-start"}`}>
                <div className={`flex items-baseline gap-1.5 ${isLocal ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="text-[11px] font-bold text-white/40">
                    {isLocal ? "You" : msg.from?.name || msg.from?.identity || "Guest"}
                  </span>
                  <span className="text-[10px] text-white/20">{time}</span>
                </div>
                <div className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] text-[13px] leading-relaxed ${
                  isLocal
                    ? "bg-brand text-white rounded-br-sm"
                    : "bg-white/8 border border-white/5 text-white/80 rounded-bl-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message the room..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="w-7 h-7 rounded-lg bg-brand hover:bg-brand-2 disabled:opacity-30 flex items-center justify-center transition-all hover:scale-110 shrink-0"
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
