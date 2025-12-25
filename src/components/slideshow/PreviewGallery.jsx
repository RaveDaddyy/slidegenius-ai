import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle, Package, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SlideCanvas from './SlideCanvas';
import SlideEditor from './SlideEditor';

export default function PreviewGallery({ slides, isGenerating, generationStep, platform, onSlideEdit }) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedSlides, setDownloadedSlides] = useState(new Set());

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    
    for (let i = 0; i < slides.length; i++) {
      const canvas = document.getElementById(`slide-canvas-${i}`);
      if (canvas) {
        const link = document.createElement('a');
        link.download = `slide_${String(i + 1).padStart(2, '0')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setDownloadedSlides(prev => new Set([...prev, i]));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setDownloadingAll(false);
    setTimeout(() => setDownloadedSlides(new Set()), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              {isGenerating ? 'Generating...' : 'Your Slides'}
            </h2>
            {platform && !isGenerating && (
              <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 text-xs font-medium uppercase">
                {platform}
              </span>
            )}
          </div>
          <p className="text-sm text-white/40">
            {isGenerating ? generationStep : `${slides.length} slides ready for download`}
          </p>
        </div>
        
        {slides.length > 0 && !isGenerating && (
          <Button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="bg-white/10 hover:bg-white/20 text-white border-0"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Download All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slides.map((slide, index) => (
          <SlideCard
            key={index}
            slide={slide}
            index={index}
            isDownloaded={downloadedSlides.has(index)}
            onEdit={onSlideEdit}
          />
        ))}
        
        {/* Loading placeholders */}
        {isGenerating && slides.length < 10 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[9/16] rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SlideCard({ slide, index, isDownloaded, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const canvas = document.getElementById(`slide-canvas-${index}`);
    if (canvas) {
      const link = document.createElement('a');
      link.download = `slide_${String(index + 1).padStart(2, '0')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setTimeout(() => setIsDownloading(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide Number Badge */}
      <div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xs font-semibold text-white">
        {index + 1}
      </div>

      {/* Canvas Container */}
      <div 
        className={`rounded-xl overflow-hidden bg-black shadow-2xl ${
          slide.platform === 'instagram' 
            ? slide.instagramFormat === '1:1' 
              ? 'aspect-square' 
              : 'aspect-[4/5]'
            : 'aspect-[9/16]'
        }`}
      >
        <SlideCanvas slide={slide} index={index} />
      </div>

      {/* Hover Overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 pointer-events-none"
        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        <Button
          onClick={() => onEdit(slide, index)}
          className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-white text-black hover:bg-white/90 font-medium"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isDownloaded ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Downloaded
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </motion.div>

      {/* Text Preview */}
      <div className="mt-2 px-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-white/60 truncate flex-1">{slide.headline}</p>
          {slide.edited && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
              Edited
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}