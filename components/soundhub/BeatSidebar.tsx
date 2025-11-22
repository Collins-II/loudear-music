"use client";
import React from "react";


export default function BeatSidebar(){
// Dummy top producers
const producers = Array.from({length:10}).map((_,i)=>({
id: `p${i+1}`,
name: `Producer ${i+1}`,
avatar: '',
beats: Math.floor(Math.random()*120)+10,
}));


return (
<div className="space-y-6">
<div>
<h3 className="text-lg font-bold">Top Producers</h3>
<div className="mt-3 space-y-3">
{producers.map((p,idx)=> (
<div key={p.id} className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm">{p.name.split(' ').pop()}</div>
<div className="flex-1">
<div className="font-semibold">{p.name}</div>
<div className="text-xs text-gray-400">{p.beats} beats</div>
</div>
<div className="text-sm text-gray-300">#{idx+1}</div>
</div>
))}
</div>
</div>


<div className="bg-white/5 rounded p-4">
<h4 className="font-semibold">Categories</h4>
<div className="mt-3 flex flex-wrap gap-2">
{['Hip Hop','Afro Pop','RnB','Dancehall','Gospel'].map(c=> (
<button key={c} className="text-xs px-2 py-1 rounded bg-white/6">{c}</button>
))}
</div>
</div>


<div className="bg-neutral-800 h-40 rounded flex items-center justify-center text-gray-400">Advertisement</div>
</div>
);
}