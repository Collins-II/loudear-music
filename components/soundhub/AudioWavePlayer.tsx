"use client";
import React, { useEffect, useRef, useState } from "react";


export default function AudioWavePlayer({ src, onPlayChange }:{ src?: string; onPlayChange?: (p:boolean)=>void }){
const audioRef = useRef<HTMLAudioElement|null>(null);
const [isPlaying, setIsPlaying] = useState(false);
useEffect(()=>{
const a = audioRef.current;
if(!a) return;
const onEnded = ()=> setIsPlaying(false);
a.addEventListener('ended', onEnded);
return ()=> a.removeEventListener('ended', onEnded);
},[]);


const toggle = async ()=>{
if(!audioRef.current) return;
if(isPlaying){ await audioRef.current.pause(); setIsPlaying(false); onPlayChange?.(false);}
else { await audioRef.current.play(); setIsPlaying(true); onPlayChange?.(true);}
}


return (
<div className="flex items-center gap-3">
<audio ref={audioRef} src={src} preload="metadata" className="hidden" />
<button onClick={toggle} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">{isPlaying? '⏸':'▶'}</button>
{/* Simple CSS waveform bars — animate while playing via CSS when isPlaying true */}
<div className={`flex items-end gap-1 h-6 ${isPlaying? 'animate-wave':''}`}>
<div className="w-1 bg-indigo-500 h-2 rounded"></div>
<div className="w-1 bg-indigo-400 h-4 rounded"></div>
<div className="w-1 bg-indigo-300 h-6 rounded"></div>
<div className="w-1 bg-indigo-400 h-4 rounded"></div>
<div className="w-1 bg-indigo-500 h-2 rounded"></div>
</div>
<style>{`
@keyframes wave { 0% { transform: scaleY(0.3);} 50% { transform: scaleY(1);} 100% { transform: scaleY(0.3);} }
.animate-wave > div { transform-origin: bottom; animation: wave 0.9s infinite ease-in-out; }
.animate-wave > div:nth-child(1){ animation-delay: 0s }
.animate-wave > div:nth-child(2){ animation-delay: 0.12s }
.animate-wave > div:nth-child(3){ animation-delay: 0.24s }
.animate-wave > div:nth-child(4){ animation-delay: 0.12s }
.animate-wave > div:nth-child(5){ animation-delay: 0s }
`}</style>
</div>
);
}