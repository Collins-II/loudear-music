"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, UserPlus, Edit, Trash, X } from "lucide-react";

interface Contact {
  id?: string;
  heading: string;
  email: string;
  phone: string;
  subHeading: string;
  address: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<Omit<Contact, "id">>({
    heading: "",
    email: "",
    phone: "",
    subHeading: "",
    address: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch contacts from backend
  useEffect(() => {
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContacts(data.contacts);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.heading.trim() || !form.email.trim()) {
      alert("Name and email are required!");
      return;
    }

    if (editingId) {
      await fetch(`/api/contact`, {
        method: "POST",
        body: JSON.stringify({ ...form, id: editingId }),
        headers: { "Content-Type": "application/json" },
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
      setEditingId(null);
    } else {
      const res = await fetch(`/api/contact`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) setContacts((prev) => [data.contact, ...prev]);
    }

    setForm({ heading: "", email: "", phone: "", subHeading: "", address: "" });
  };

  const handleEdit = (contact: Contact) => {
    setForm({
      heading: contact.heading,
      email: contact.email,
      phone: contact.phone,
      subHeading: contact.subHeading,
      address: contact.address,
    });
    setEditingId(contact.id!);
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (deleteId) {
      await fetch(`/api/contact?id=${deleteId}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== deleteId));
    }
    setDeleteId(null);
  };
  
  const cancelDelete = () => setDeleteId(null);

  const handleSaveAll = () => alert("Contacts already saved to backend!");

  return (
    <section className="relative w-full min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-extrabold text-center mb-12"
        >
          📇 Contacts Manager
        </motion.h1>

        {/* Contact Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 space-y-6 mb-12">
          <InputGroup label="Heading" name="heading" value={form.heading} onChange={handleChange} placeholder="Heading" />
          <div className="space-y-2">
            <Label className="text-white">Sub-Heading</Label>
            <Textarea name="subHeading" value={form.subHeading} onChange={handleChange} placeholder="Write a short note" className="bg-white/80 text-black" />
          </div>
          <InputGroup label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
          <InputGroup label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter phone" />
          <InputGroup label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Physical address" />
          

          <Button onClick={handleAdd} className={`${
              editingId ? "bg-indigo-600 hover:bg-indigo-700" : "bg-orange-600"
            } text-white rounded-xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform`}>
            {editingId ? (<><Save className="w-5 h-5" /> Save Changes</>) : (<><UserPlus className="w-5 h-5" /> Add Contact</>)}
          </Button>
        </div>

        {/* Contact List */}
        <div className="grid gap-6">
          {contacts.map((contact) => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{contact.heading}</h3>
                  <p className="text-sm text-white/70">{contact.email}</p>
                  <p className="text-sm text-white/70">{contact.phone}</p>
                  <p className="text-sm text-white/80 italic">{contact.subHeading || "—"}</p>
                  <p className="mt-2 text-white/90">{contact.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(contact)} className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white"><Edit className="w-4 h-4" /></Button>
                  <Button onClick={() => handleDelete(contact.id!)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white"><Trash className="w-4 h-4" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Save All */}
        {contacts.length > 0 && <div className="mt-10 flex justify-center">
          <Button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold flex items-center gap-2 shadow-lg"><Save className="w-5 h-5" /> Save All Contacts</Button>
        </div>}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <Button onClick={cancelDelete} variant="ghost" className="p-1"><X className="w-5 h-5" /></Button>
              </div>
              <p>Are you sure you want to delete this contact?</p>
              <div className="flex justify-end gap-4">
                <Button onClick={cancelDelete} className="bg-gray-300 hover:bg-gray-400">Cancel</Button>
                <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Reusable InputGroup
interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}
function InputGroup({ label, name, value, onChange, type = "text", placeholder }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <Input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="bg-white/80 text-black" />
    </div>
  );
}
