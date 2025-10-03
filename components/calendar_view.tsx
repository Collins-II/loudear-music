"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  CalendarDays,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

interface CalendarProps {
  events: any[];
}

export default function CalendarView({ events }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<dayjs.Dayjs | null>(null);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
  const goToday = () => setCurrentMonth(dayjs());

  const getEventsForDay = (day: dayjs.Dayjs) =>
    events.filter((event) => dayjs(event.date).isSame(day, "day"));

  const selectedDayEvents =
    selectedDay !== null ? getEventsForDay(selectedDay) : [];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-gray-900 shadow-xl rounded-2xl text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          aria-label="previous-month"
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">
            {currentMonth.format("MMMM YYYY")}
          </h2>
        </div>
        <button
          aria-label="next-month"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5 text-indigo-400" />
        </button>
      </div>

      {/* Today Button */}
      <div className="flex justify-end mb-4">
        <button
          aria-label="today"
          onClick={goToday}
          className="px-4 py-1 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 transition"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="uppercase">
            {d}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.format("MM-YYYY")}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-2 mt-2"
        >
          {Array.from({ length: startOfMonth.day() }).map((_, idx) => (
            <div key={idx} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = startOfMonth.add(idx, "day");
            const isToday = day.isSame(dayjs(), "day");
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`h-20 p-2 border rounded-lg cursor-pointer relative hover:shadow-lg transition
                ${
                  isToday
                    ? "bg-indigo-900/30 border-indigo-500"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 text-xs ${
                    isToday ? "text-indigo-400 font-bold" : "text-gray-300"
                  }`}
                >
                  {day.date()}
                </span>

                {/* Event Previews */}
<div className="h-full w-full absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 w-full px-1">
  {dayEvents.slice(0, 2).map((event) => (
    <div
      key={event.id}
      className="w-full h-full flex items-center gap-1 bg-white/90 dark:bg-neutral-800/80 rounded-md shadow-sm px-1 py-0.5 w-full overflow-hidden"
      title={event.title}
    >
      <Image
        src={event.bannerImage}
        alt={event.title}
        fill
        className=" rounded object-cover flex-shrink-0"
      />
      <span className="text-[10px] truncate">{event.title}</span>
    </div>
  ))}

  {/* Show "+ more" if many events */}
  {dayEvents.length > 2 && (
    <span className="text-[10px] text-blue-500 font-medium">
      +{dayEvents.length - 2} more
    </span>
  )}
</div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Modal for Selected Day */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-indigo-400">
                  Events on {selectedDay.format("MMMM DD, YYYY")}
                </h3>
                <button
                  aria-label="close"
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-indigo-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col md:flex-row gap-4 bg-gray-800 rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                    >
                      <div className="relative md:w-1/3 h-40 md:h-auto">
                        <Image
                          src={event.bannerImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between p-4 md:w-2/3 gap-2">
                        <h4 className="text-lg font-bold text-indigo-300">
                          {event.title}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-indigo-400" />
                            {new Date(event.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            {event.location}
                          </span>
                        </div>
                        <Button className="mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2">
                          Get Tickets ({event.priceRange})
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">
                    No events for this day.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
