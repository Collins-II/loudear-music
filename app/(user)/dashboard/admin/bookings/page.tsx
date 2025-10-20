"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PlusCircle, Save, Calendar } from "lucide-react";

interface Show {
  id: number;
  name: string;
  date: string;
  venue: string;
  city: string;
  ticketLink: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export default function BookingsShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [form, setForm] = useState<Omit<Show, "id">>({
    name: "",
    date: "",
    venue: "",
    city: "",
    ticketLink: "",
    status: "Scheduled",
  });

  // Load dummy data
  useEffect(() => {
    const saved = sessionStorage.getItem("bookingsData");
    if (saved) {
      setShows(JSON.parse(saved));
    } else {
      const dummy: Show[] = [
        {
          id: 1,
          name: "Rich Bizzy Live at Lusaka",
          date: "2025-09-15",
          venue: "Lusaka National Stadium",
          city: "Lusaka",
          ticketLink: "https://tickets.com/lusaka",
          status: "Scheduled",
        },
        {
          id: 2,
          name: "VIP Concert Ndola",
          date: "2025-09-20",
          venue: "Ndola Arena",
          city: "Ndola",
          ticketLink: "https://tickets.com/ndola",
          status: "Scheduled",
        },
        {
          id: 3,
          name: "Charity Event Kitwe",
          date: "2025-08-10",
          venue: "Kitwe Hall",
          city: "Kitwe",
          ticketLink: "https://tickets.com/kitwe",
          status: "Completed",
        },
      ];
      setShows(dummy);
      sessionStorage.setItem("bookingsData", JSON.stringify(dummy));
    }
  }, []);

  // Filter & search
  useEffect(() => {
    let results = shows;
    if (search.trim() !== "") {
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus !== "All") {
      results = results.filter((s) => s.status === filterStatus);
    }
    setFilteredShows(results);
  }, [search, filterStatus, shows]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddShow = () => {
    if (!form.name || !form.date || !form.venue) return;

    const newShow: Show = { id: Date.now(), ...form };
    const updated = [...shows, newShow];
    setShows(updated);
    setForm({
      name: "",
      date: "",
      venue: "",
      city: "",
      ticketLink: "",
      status: "Scheduled",
    });
    sessionStorage.setItem("bookingsData", JSON.stringify(updated));
  };

  const handleSaveAll = () => {
    sessionStorage.setItem("bookingsData", JSON.stringify(shows));
    alert("Bookings & Shows saved successfully!");
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-12"
        >
          🎤 Bookings & Shows
        </motion.h1>

        {/* Add New Show Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md p-6 rounded-2xl space-y-6 border border-white/20 shadow-lg mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-4">Add New Show</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Event Name</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter event name"
                className="bg-white/80 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Date</Label>
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="bg-white/80 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Venue</Label>
              <Input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Enter venue"
                className="bg-white/80 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">City</Label>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="bg-white/80 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Ticket Link</Label>
              <Input
                name="ticketLink"
                value={form.ticketLink}
                onChange={handleChange}
                placeholder="Enter ticket URL"
                className="bg-white/80 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, status: val as Show["status"] }))
                }
              >
                <SelectTrigger className="bg-white/80 text-black">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAddShow}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-5 h-5" /> Add Show
          </Button>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 bg-white/80 text-black rounded-xl"
          />

          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
            //className="w-full md:w-1/4"
          >
            <SelectTrigger className="bg-white/80 text-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shows Table */}
        <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <table className="min-w-full text-left text-white">
            <thead className="border-b border-white/20">
              <tr>
                <th className="px-4 py-2">Event Name</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Venue</th>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {filteredShows.map((show) => (
                <tr key={show.id} className="border-b border-white/10">
                  <td className="px-4 py-2">{show.name}</td>
                  <td className="px-4 py-2">{show.date}</td>
                  <td className="px-4 py-2">{show.venue}</td>
                  <td className="px-4 py-2">{show.city}</td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      show.status === "Scheduled"
                        ? "text-green-400"
                        : show.status === "Completed"
                        ? "text-blue-400"
                        : "text-red-400"
                    }`}
                  >
                    {show.status}
                  </td>
                  <td className="px-4 py-2">
                    {show.ticketLink && (
                      <a
                        href={show.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Link
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleSaveAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" /> Save All Bookings
          </Button>
        </div>
      </div>
    </section>
  );
}
