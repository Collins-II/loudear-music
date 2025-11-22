"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/lib/store";
import { removeItem, setItems } from "@/lib/store/cartSlice";
import { IoIosClose } from "react-icons/io";
import { Separator } from "./ui/separator";
import StripeButton from "./StripeButton";

interface CartProps {
  setCartOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CartSidebar({ setCartOpen }: CartProps) {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState(true);

  // Initialize cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        dispatch(setItems(parsed));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
    setLoading(false);
  }, [dispatch]);

  // Persist cart changes to localStorage
  useEffect(() => {
    if (!loading) localStorage.setItem("cart", JSON.stringify(items));
  }, [items, loading]);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handleRemove = (beatId: string, licenseId: string) => {
    dispatch(removeItem({ beatId, licenseId }));
  };

  if (loading) {
    return (
      <aside className="w-full p-4 h-full flex items-center justify-center bg-white dark:bg-black/90 text-gray-500">
        Loading cart...
      </aside>
    );
  }

  return (
    <aside className="w-full bg-white dark:bg-black/90 p-4 h-full shadow-xl flex flex-col">
      <div className="flex items-center justify-between">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your Cart</h3>
       <button
          aria-label="close-button"
          onClick={() => setCartOpen(false)}
          className={`relative p-2 rounded-full transition text-black/90`}
         >
           <IoIosClose size={30}/>
        </button>
      </div>
      <Separator className="mb-3"/>

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-300">
          Cart is empty
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={`${item.beatId}-${item.licenseId}-${idx}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-2 p-2 bg-gray-100 dark:bg-black/70 rounded"
              >
                {/* Thumbnail */}
                {item.image ? (
                  <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.licenseId} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 rounded">
                    Beat
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${(item.price / 100).toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.beatId, item.licenseId)}
                  className="text-red-500 text-xs hover:underline flex-shrink-0"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 border-t border-gray-300 dark:border-gray-700 pt-3">
        <div className="flex justify-between items-center mb-3 text-gray-900 dark:text-white">
          <span className="text-sm">Total:</span>
          <span className="font-bold">${(total / 100).toFixed(2)}</span>
        </div>
        <StripeButton />
      </div>
    </aside>
  );
}
