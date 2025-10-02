"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

// Example events data
const events = [
  { date: new Date(2025, 7, 25), title: "Lusaka Live Concert" },
  { date: new Date(2025, 8, 10), title: "Kitwe Music Festival" },
  { date: new Date(2025, 10, 2), title: "Ndola Yo Maps Experience" },
];

const monthsWithEvents = Array.from(
  new Set(events.map((e) => e.date.getMonth()))
);

export default function EventsCalendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const currentMonth = monthsWithEvents[currentMonthIndex];

  const monthEvents = events.filter(
    (e) => e.date.getMonth() === currentMonth
  );

  const monthName = new Date(2025, currentMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const nextMonth = () =>
    setCurrentMonthIndex((prev) =>
      prev < monthsWithEvents.length - 1 ? prev + 1 : prev
    );
  const prevMonth = () =>
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : prev));

  return (
    <section className="py-12 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold text-indigo-600 flex items-center justify-center gap-2">
          <CalendarDays className="w-7 h-7 text-amber-500" />
          Upcoming Events
        </h2>
        <p className="text-gray-600 mt-2">
          Explore Yo Maps Yo’s shows and concerts month by month.
        </p>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={prevMonth}
            disabled={currentMonthIndex === 0}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-40"
          >
            Previous
          </Button>
          <h3 className="text-xl font-semibold text-indigo-700">{monthName}</h3>
          <Button
            onClick={nextMonth}
            disabled={currentMonthIndex === monthsWithEvents.length - 1}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-40"
          >
            Next
          </Button>
        </div>

        {/* Events List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-8 grid gap-4"
          >
            {monthEvents.length > 0 ? (
              monthEvents.map((event, i) => (
                <motion.div
                  key={i}
                  className="p-4 bg-white border-l-4 border-amber-500 rounded-xl shadow-sm hover:shadow-md transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-lg font-semibold text-indigo-700">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.date.toDateString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 italic">No events this month.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
