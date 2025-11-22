import React from "react";

export default function PayDone() {
  return (
    <div className="flex flex-col items-center py-20">
      <h1 className="text-4xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p className="mt-4 text-lg">
        Your files are being emailed to you right now.
      </p>
    </div>
  );
}
