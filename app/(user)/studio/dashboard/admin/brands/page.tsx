"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Save, Search } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface Partner {
  id: number;
  name: string;
  industry: string;
  description: string;
  website: string;
  logo: string;
  status: "Active" | "Pending" | "Past";
}

const COLORS = ["#facc15", "#fb923c", "#ef4444", "#3b82f6", "#22c55e"];

export default function PartnershipsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterIndustry, setFilterIndustry] = useState<string>("All");

  const [form, setForm] = useState<Omit<Partner, "id">>({
    name: "",
    industry: "",
    description: "",
    website: "",
    logo: "",
    status: "Active",
  });

  // Load dummy data
  useEffect(() => {
    const saved = sessionStorage.getItem("partnersData");
    if (saved) {
      setPartners(JSON.parse(saved));
    } else {
      const dummy: Partner[] = [
        {
          id: 1,
          name: "MTN Zambia",
          industry: "Telecom",
          description: "Leading telecom brand supporting music festivals.",
          website: "https://www.mtn.zm",
          logo: "/images/bizzy02.jpg",
          status: "Active",
        },
        {
          id: 2,
          name: "Castle Lite",
          industry: "Beverages",
          description: "Sponsoring concerts and live shows.",
          website: "https://www.castlelite.com",
          logo: "/images/bizzy03.jpg",
          status: "Active",
        },
        {
          id: 3,
          name: "Nike Africa",
          industry: "Fashion",
          description: "Partnered for artist merchandise drops.",
          website: "https://www.nike.com",
          logo: "/images/bizzy04.jpg",
          status: "Pending",
        },
        {
          id: 4,
          name: "Airtel Music",
          industry: "Streaming",
          description: "Exclusive content promotion on Airtel platform.",
          website: "https://www.airtel.com",
          logo: "/images/bizzy06.jpg",
          status: "Past",
        },
      ];
      setPartners(dummy);
      sessionStorage.setItem("partnersData", JSON.stringify(dummy));
    }
  }, []);

  // Update filtered partners whenever filters/search change
  useEffect(() => {
    let results = partners;

    // Search filter
    if (search.trim() !== "") {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.industry.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "All") {
      results = results.filter((p) => p.status === filterStatus);
    }

    // Industry filter
    if (filterIndustry !== "All") {
      results = results.filter((p) => p.industry === filterIndustry);
    }

    setFilteredPartners(results);
  }, [search, filterStatus, filterIndustry, partners]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPartner = () => {
    if (!form.name || !form.industry) return;

    const newPartner: Partner = { id: Date.now(), ...form };
    const updated = [...partners, newPartner];
    setPartners(updated);
    setForm({
      name: "",
      industry: "",
      description: "",
      website: "",
      logo: "",
      status: "Active",
    });
    sessionStorage.setItem("partnersData", JSON.stringify(updated));
  };

  const handleSaveAll = () => {
    sessionStorage.setItem("partnersData", JSON.stringify(partners));
    alert("Partnerships saved successfully!");
  };

  // Analytics Data
  const industryData = partners.reduce((acc: any[], p) => {
    const existing = acc.find((d) => d.name === p.industry);
    if (existing) existing.value += 1;
    else acc.push({ name: p.industry, value: 1 });
    return acc;
  }, []);

  const statusData = partners.reduce((acc: any[], p) => {
    const existing = acc.find((d) => d.name === p.status);
    if (existing) existing.value += 1;
    else acc.push({ name: p.status, value: 1 });
    return acc;
  }, []);

  // Unique industries for filtering
  const industries = ["All", ...new Set(partners.map((p) => p.industry))];

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-12"
        >
          🤝 Partnerships & Brands
        </motion.h1>

        {/* Partner Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 space-y-6 mb-12">
          <div>
            <Label className="text-white">Brand Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Coca-Cola"
              className="bg-white/80 text-black rounded-xl"
            />
          </div>

          <div>
            <Label className="text-white">Industry</Label>
            <Input
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="e.g. Beverages, Telecom, Fashion"
              className="bg-white/80 text-black rounded-xl"
            />
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe partnership details..."
              className="bg-white/80 text-black rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white">Website</Label>
              <Input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://brand.com"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>

            <div>
              <Label className="text-white">Logo URL</Label>
              <Input
                name="logo"
                value={form.logo}
                onChange={handleChange}
                placeholder="/assets/brands/logo.png"
                className="bg-white/80 text-black rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Status</Label>
            <Select
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value as any }))
              }
              value={form.status}
            >
              <SelectTrigger className="bg-white/80 text-black rounded-xl">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddPartner}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            <PlusCircle className="w-5 h-5" /> Add Partner
          </Button>
        </div>


        {/* Filter + Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Input
              placeholder="Search brands or industries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/80 text-black rounded-xl"
            />
            <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
          </div>

          {/* Filter by Status */}
          <div className="w-full md:w-1/4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white/80 text-black rounded-xl">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Industry */}
          <div className="w-full md:w-1/4">
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="bg-white/80 text-black rounded-xl">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry, i) => (
                  <SelectItem key={i} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Partner Grid */}
        {filteredPartners.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 text-center"
              >
                {partner.logo && (
                  <div className="mx-auto mb-4 w-24 h-24 relative">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold">{partner.name}</h3>
                <p className="text-sm text-white/70">{partner.industry}</p>
                <p className="mt-2 text-white/90">{partner.description}</p>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline text-sm block mt-2"
                >
                  Visit Website
                </a>
                <p
                  className={`mt-3 text-sm font-semibold ${
                    partner.status === "Active"
                      ? "text-green-400"
                      : partner.status === "Pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {partner.status}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-8">
            No partners found matching your filters.
          </p>
        )}

        {/* Save Button */}
        {partners.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={handleSaveAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Save className="w-5 h-5" /> Save All Partnerships
            </Button>
          </div>
        )}

        {/* Analytics */}
        {partners.length > 0 && (
          <div className="mt-16 space-y-12">
            <h2 className="text-3xl font-bold text-center">
              📊 Partnership Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Industries */}
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">By Industry</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData}>
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status */}
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">By Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={120}
                      label
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
