import { useEffect, useRef } from "react";

declare global {
  interface Window {
    pannellum: any;
  }
}

interface Props {
  imageUrl: string;
  title?: string;
}

export const PanoramaViewer = ({ imageUrl, title }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || !window.pannellum) return;
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch {}
    }
    viewerRef.current = window.pannellum.viewer(ref.current, {
      type: "equirectangular",
      panorama: imageUrl,
      autoLoad: true,
      title,
      compass: true,
      showZoomCtrl: true,
      hfov: 110,
      mouseZoom: true,
    });
    return () => {
      try {
        viewerRef.current?.destroy();
      } catch {}
    };
  }, [imageUrl, title]);

  return <div ref={ref} className="h-full w-full rounded-lg overflow-hidden bg-secondary" />;
};