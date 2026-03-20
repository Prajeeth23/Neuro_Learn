import React from 'react';
import { PlayCircle } from 'lucide-react';

export const VideoPlayer = ({ url, title }) => {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/80 flex items-center justify-center border border-white/20 shadow-glow">
      {/* If url exists we could use iframe/video, otherwise placeholder */}
      {url ? (
        <video controls className="w-full h-full object-cover">
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex flex-col items-center text-white/50">
          <PlayCircle size={64} className="mb-4 opacity-50 text-accent transition-transform hover:scale-110 cursor-pointer" />
          <p>No video available for "{title}"</p>
        </div>
      )}
    </div>
  );
};
