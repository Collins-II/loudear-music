import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils"; // relative date utility
import { Event } from "@/app/events/page";

export default function EventCard({ event }: { event: Event }) {
  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col lg:flex-row gap-6 bg-gradient-to-b from-black/20 via-black/10 to-black/20 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-102 transform transition-all duration-300"
    >
      {/* Event Image */}
      <div className="relative lg:w-1/2 h-64 lg:h-auto flex-shrink-0">
        <Image
          src={event.bannerImage}
          alt={event.title}
          fill
          className="object-cover rounded-l-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Event Info */}
      <div className="flex flex-col justify-between p-6 lg:w-1/2 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white line-clamp-2">
            {event.title}
          </h2>
         {/* <p className="text-white/70 mt-2 line-clamp-3">{event.description}</p>

           Date & Location */}
          <div className="flex flex-col items-start gap-4 mt-4 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex flex-col items-start text-white/70 flex-shrink-0">
                <span className="text-2xl md:text-3xl font-bold text-indigo-400">
                  {new Date(event.date).getDate()}
                </span>
                <span className="text-sm md:text-md font-semibold">
                  {new Date(event.date).toLocaleString("default", { month: "short" })}
                </span>
            </div>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-5 h-5 text-indigo-400" />
              {event.location}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="mt-4 self-start rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-6 py-2 transition-all shadow-md">
          Tickets ({event.priceRange})
        </Button>
      </div>
    </motion.div>
  );
}
