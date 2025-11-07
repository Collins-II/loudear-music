"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Save, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

  // Load dummy data
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

  const handleSaveAll = () => {
    console.log("Saving reports:", reports);
    alert("Reports saved successfully!");
  };

  const filteredReports = reports.filter(
    (r) =>
      (filterMonth === "All" || r.month === filterMonth) &&
      (filterType === "All" || r.type === filterType)
  );

  const totalRevenue = reports.filter(r => r.type === "Revenue").reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = reports.filter(r => r.type === "Expense").reduce((sum, r) => sum + r.amount, 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <section className="min-h-screen bg-gray-900 text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6">💰 Financial Reports</h1>

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
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Enter notes"
                className="bg-white/80 text-black"
                rows={2}
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
              <SelectItem value="January">January</SelectItem>
              <SelectItem value="February">February</SelectItem>
              <SelectItem value="March">March</SelectItem>
              <SelectItem value="April">April</SelectItem>
              <SelectItem value="May">May</SelectItem>
              <SelectItem value="June">June</SelectItem>
              <SelectItem value="July">July</SelectItem>
              <SelectItem value="August">August</SelectItem>
              <SelectItem value="September">September</SelectItem>
              <SelectItem value="October">October</SelectItem>
              <SelectItem value="November">November</SelectItem>
              <SelectItem value="December">December</SelectItem>
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

        {/* Reports Table */}
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
                  <TableCell>{r.month}</TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>${r.amount.toLocaleString()}</TableCell>
                  <TableCell>{r.notes}</TableCell>
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

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleSaveAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" /> Save All Reports
          </Button>
          <Button
            onClick={() => alert("Download functionality coming soon")}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg ml-4"
          >
            <Download className="w-5 h-5" /> Download Reports
          </Button>
        </div>
      </div>
    </section>
  );
}
