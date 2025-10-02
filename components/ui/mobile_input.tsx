"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import { E164Number } from "libphonenumber-js/core";

export default function MobileNumberInput() {
  const [value, setValue] = useState<E164Number | undefined>();

  return (
    <div className="grid w-full max-w-full text-xs sm:text-sm gap-2">
      <Label htmlFor="mobile" className="text-sm text-gray-400 pl-4 font-light">
        Phone Number
      </Label>

      <PhoneInput
        id="mobile"
        defaultCountry="ZM" // Zambia default
        international
        withCountryCallingCode
        placeholder="Enter your phone number"
        value={value}
        onChange={setValue}
        className={cn(
          // wrapper styles
          "flex w-full items-center gap-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 text-xs sm:text-sm rounded-lg px-2 py-1 text-white shadow-lg focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition",
          "react-tel-input" // ensure consistency
        )}
      />
      <style jsx global>{`
        /* react-phone-number-input default overrides */
        .PhoneInput {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1rem;
          padding: 0.5rem;
        }
        .PhoneInputInput::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        .PhoneInputCountry {
          margin-right: 0.5rem;
        }
        .PhoneInputCountrySelect {
          background: #111;
          color: white;
          border: 1px solid #444;
          border-radius: 6px;
          padding: 0.25rem;
        }
      `}</style>
    </div>
  );
}
