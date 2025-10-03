"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Use `any` for types since react-quill-new doesn't export Delta/UnprivilegedEditor
  const handleChange = (content: string, _delta: any, _source: string, editor: any) => {
    onChange(editor.getText().trim()); // plain text
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
