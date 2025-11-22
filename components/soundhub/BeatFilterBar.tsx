"use client";
import React from "react";
import { Button } from "@/components/ui/button";


export default function BeatFilterBar({ filters, setFilters }:{ filters:any; setFilters:any }){
const genres = ["All","Hip Hop","Afro Pop","RnB","Dancehall"];
const moods = ["All","Dark","Happy","Chill","Aggressive"];
return (
<div className="flex items-center justify-between mb-6">
<div className="flex gap-3 items-center">
<select aria-label="select-input" className="bg-white/5 px-3 py-2 rounded" value={filters.genre} onChange={(e)=> setFilters((f:any)=>({...f, genre: e.target.value}))}>
{genres.map(g=> <option key={g} value={g}>{g}</option>)}
</select>


<select aria-label="select-input" className="bg-white/5 px-3 py-2 rounded" value={filters.mood} onChange={(e)=> setFilters((f:any)=>({...f, mood: e.target.value}))}>
{moods.map(m=> <option key={m} value={m}>{m}</option>)}
</select>


<select aria-label="select-input" className="bg-white/5 px-3 py-2 rounded" value={filters.sort} onChange={(e)=> setFilters((f:any)=>({...f, sort: e.target.value}))}>
<option value="latest">Latest</option>
<option value="popular">Popular</option>
</select>


<Button variant="secondary" onClick={()=> setFilters((f:any)=>({...f, view: f.view === 'grid' ? 'list' : 'grid'}))}>{filters.view === 'grid' ? 'List' : 'Grid'}</Button>
</div>


<div className="flex gap-3">
<input type="search" placeholder="Search beats, producers..." className="bg-white/5 px-3 py-2 rounded w-64" onChange={(e)=> setFilters((f:any)=>({...f, q: e.target.value}))} />
<Button variant="ghost">Advanced</Button>
</div>
</div>
);
}