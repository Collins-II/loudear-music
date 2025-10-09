import { Suspense } from "react";
import IndexPage from "./components/IndexSearch";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-gray-400">Loading search...</div>}>
      <IndexPage />
    </Suspense>
  );
}
