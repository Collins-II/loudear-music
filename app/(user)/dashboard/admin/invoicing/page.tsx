"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PlusCircle, Save, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";
//import { CSVLink } from "react-csv";

interface Report {
  id: number;
  month: string;
  year: number;
  type: "Revenue" | "Expense" | "Other";
  amount: number;
  notes: string;
}

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [form, setForm] = useState<Omit<Report, "id">>({
    month: "",
    year: new Date().getFullYear(),
    type: "Revenue",
    amount: 0,
    notes: "",
  });
  const [filterMonth, setFilterMonth] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");

  useEffect(() => {
    const dummyData: Report[] = [
      { id: 1, month: "September", year: 2025, type: "Revenue", amount: 12000, notes: "Concert earnings" },
      { id: 2, month: "August", year: 2025, type: "Expense", amount: 4000, notes: "Studio rental" },
      { id: 3, month: "July", year: 2025, type: "Revenue", amount: 15000, notes: "Streaming royalties" },
      { id: 4, month: "July", year: 2025, type: "Expense", amount: 2000, notes: "Marketing & Promotion" },
    ];
    setReports(dummyData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "amount" ? parseFloat(value) : value }));
  };

  const handleAddReport = () => {
    const newReport: Report = { id: Date.now(), ...form };
    setReports((prev) => [...prev, newReport]);
    setForm({
      month: "",
      year: new Date().getFullYear(),
      type: "Revenue",
      amount: 0,
      notes: "",
    });
  };

  const handleInlineChange = (id: number, field: keyof Report, value: string | number) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSaveAll = () => {
    console.log("Saving reports:", reports);
    alert("Reports saved successfully!");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Financial Reports", 10, 10);
    reports.forEach((r, i) => {
      doc.text(`${r.month} ${r.year} | ${r.type} | $${r.amount} | ${r.notes}`, 10, 20 + i * 10);
    });
    doc.save("financial_reports.pdf");
  };

  const filteredReports = reports.filter(
    (r) =>
      (filterMonth === "All" || r.month === filterMonth) &&
      (filterType === "All" || r.type === filterType)
  );

  // Prepare chart data
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const chartData = months.map((m) => {
    const monthReports = reports.filter(r => r.month === m);
    return {
      month: m,
      Revenue: monthReports.filter(r => r.type === "Revenue").reduce((sum, r) => sum + r.amount, 0),
      Expense: monthReports.filter(r => r.type === "Expense").reduce((sum, r) => sum + r.amount, 0),
    };
  }).filter(d => d.Revenue > 0 || d.Expense > 0);

  const totalRevenue = reports.filter(r => r.type === "Revenue").reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = reports.filter(r => r.type === "Expense").reduce((sum, r) => sum + r.amount, 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <section className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-6">💰 Financial Reports</h1>

        {/* Add Report Form */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg space-y-6">
          <h2 className="text-xl font-bold text-white">Add New Report Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Month</Label>
              <Input
                name="month"
                value={form.month}
                onChange={handleChange}
                placeholder="Enter month"
                className="bg-white/80 text-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Year</Label>
              <Input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className="bg-white/80 text-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Type</Label>
              <Select value={form.type} onValueChange={(val) => setForm(prev => ({ ...prev, type: val as Report["type"] }))}>
                <SelectTrigger className="bg-white/80 text-black">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Amount</Label>
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="bg-white/80 text-black"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Notes</Label>
              <Input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Enter notes"
                className="bg-white/80 text-black"
              />
            </div>
          </div>
          <Button
            onClick={handleAddReport}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Add Report
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Select value={filterMonth} onValueChange={setFilterMonth} >
            <SelectTrigger className="bg-white/80 text-black">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType} >
            <SelectTrigger className="bg-white/80 text-black">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Revenue">Revenue</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#888" />
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#22c55e" />
              <Line type="monotone" dataKey="Expense" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reports Table with Inline Editing */}
        <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Input
                      value={r.month}
                      onChange={(e) => handleInlineChange(r.id, "month", e.target.value)}
                      className="bg-transparent text-white border-none w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={r.year}
                      onChange={(e) => handleInlineChange(r.id, "year", parseInt(e.target.value))}
                      className="bg-transparent text-white border-none w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.type}
                      onValueChange={(val) => handleInlineChange(r.id, "type", val as Report["type"])}
                    >
                      <SelectTrigger className="bg-transparent text-white border-none">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={r.amount}
                      onChange={(e) => handleInlineChange(r.id, "amount", parseFloat(e.target.value))}
                      className="bg-transparent text-white border-none w-full"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={r.notes}
                      onChange={(e) => handleInlineChange(r.id, "notes", e.target.value)}
                      className="bg-transparent text-white border-none w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <p className="text-sm text-white/70">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <p className="text-sm text-white/70">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center shadow-lg border border-white/20">
            <p className="text-sm text-white/70">Profit</p>
            <p className="text-2xl font-bold text-yellow-400">${profit.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-center">
            <Button
              onClick={handleSaveAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Save className="w-5 h-5" /> Save All Campaigns
            </Button>
        </div>
        </div>
        </section>
  )}