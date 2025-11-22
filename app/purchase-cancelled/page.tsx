import React from "react";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center py-20">
      <h1 className="text-4xl font-bold text-red-600">Payment Canceled ❌</h1>
      <p className="mt-4 text-lg">You can try again anytime.</p>
    </div>
  );
}
