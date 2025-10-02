"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; // Quill theme
import type { Quill } from "react-quill-new";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function WysiwygEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Convert Quill's delta content to plain text on change
  const handleChange = (content: string, delta: any, source: string, editor: Quill) => {
    onChange(editor.getText().trim()); // plain text only
  };

  return (
    <div className="w-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        className="bg-white text-slate-900 rounded-md border border-gray-300 shadow-sm 
                   focus-within:ring-2 focus-within:ring-green-500 w-full min-h-[120px]"
      />
    </div>
  );
}
