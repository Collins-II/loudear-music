// hooks/useDownload.ts
import { useDispatch } from "react-redux";
import {
  startDownload,
  updateProgress,
  completeDownload,
  failDownload,
} from "@/lib copy/store/audioSlice";

export function useDownload() {
  const dispatch = useDispatch();

  const downloadFile = async (url: string, filename: string) => {
    try {
      dispatch(startDownload(url));

      const response = await fetch(url);
      const reader = response.body?.getReader();
      const contentLength = +response.headers.get("Content-Length")!;

      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;

        const progress = Math.floor((receivedLength / contentLength) * 100);
        dispatch(updateProgress(progress));
      }

      // combine chunks into blob
      const blob = new Blob(chunks);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      dispatch(completeDownload());
    } catch (err) {
      dispatch(failDownload());
    }
  };

  return { downloadFile };
}
