"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import MobileNumberInput from "./ui/mobile_input";

export default function ContactBookings() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Your booking request has been submitted!");
    }, 2000);
  };

  return (
    <section 
  id="contact" 
  className="w-full bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-4 sm:px-6 md:px-12"
>
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-10 items-center">
    
    {/* LEFT SIDE - Contact Info */}
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 sm:space-y-8"
    >
      <h2 className="text-yellow-400 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-snug">
        Contact & Bookings
      </h2>
      <p className="flex-wrap text-gray-300 max-w-md text-sm sm:text-base">
        Get in touch with Olios Records for artist bookings, partnerships, and media inquiries.  
        We’ll respond within 24 hours.
      </p>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <Mail className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="truncate">bookings@richbizzy.com</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <Phone className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="truncate">+260 977 777777</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
          <MapPin className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="truncate">Lusaka, Zambia</span>
        </div>
      </div>
    </motion.div>

    {/* RIGHT SIDE - Booking Form */}
   {/* RIGHT SIDE - Booking Form */}
<motion.div
  initial={{ x: 30, opacity: 0 }}
  whileInView={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  <Card className="bg-gray-900/80 border border-gray-700 rounded-xl shadow-lg backdrop-blur-md">
    <CardContent className="p-3 sm:p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
        
        <Input 
          placeholder="Your Full Name" 
          className="w-full min-w-0 bg-gray-800 border-gray-700 text-white 
                     placeholder:text-gray-400 text-xs sm:text-sm"
          required 
        />

        <Input 
          type="email" 
          placeholder="Your Email Address" 
          className="w-full min-w-0 bg-gray-800 border-gray-700 text-white 
                     placeholder:text-gray-400 text-xs sm:text-sm"
          required 
        />

        <div className="w-full min-w-0">
          <MobileNumberInput />
        </div>

        <Input 
          placeholder="Subject (e.g., Artist Booking)" 
          className="w-full min-w-0 bg-gray-800 border-gray-700 text-white 
                     placeholder:text-gray-400 text-xs sm:text-sm"
          required 
        />

        <Textarea 
          placeholder="Your Message / Booking Details..." 
          className="w-full min-w-0 bg-gray-800 border-gray-700 text-white 
                     placeholder:text-gray-400 h-24 sm:h-32 text-xs sm:text-sm resize-y"
          required 
        />

        <Button 
          type="submit" 
          className="w-full rounded-lg bg-yellow-700 hover:bg-yellow-600 hover:to-yellow-500 text-white font-medium py-2 text-xs sm:text-sm"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Booking Request"}
        </Button>
      </form>
    </CardContent>
  </Card>
</motion.div>

  </div>
</section>
  );
}
