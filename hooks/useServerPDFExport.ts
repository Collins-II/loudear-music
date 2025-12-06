export function useServerPDFExport() {
  const exportPDF = async (options: { songId?: string; exportAll?: boolean }) => {
    const res = await fetch("/api/royalties/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const j = await res.json();
      throw new Error(j.error || "Failed to export PDF");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "royalty-splits.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  return { exportPDF };
}
