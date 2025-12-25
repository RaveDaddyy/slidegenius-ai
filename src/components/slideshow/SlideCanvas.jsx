import React, { useRef, useEffect, useState } from 'react';

export default function SlideCanvas({ slide, index }) {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine canvas dimensions based on platform and format
  let CANVAS_WIDTH = 1080;
  let CANVAS_HEIGHT = 1920; // Default: 9:16 for TikTok
  
  if (slide.platform === 'instagram') {
    if (slide.instagramFormat === '1:1') {
      CANVAS_HEIGHT = 1080; // Square
    } else {
      CANVAS_HEIGHT = 1350; // 4:5 Portrait (default for Instagram)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const renderSlide = (backgroundImage = null) => {
      // Clear canvas
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Platform-specific settings
      const platform = slide.platform || 'tiktok';
      const isTikTok = platform === 'tiktok';
      const isTitleSlide = slide.index === 1;
      const isFinalSlide = slide.isFinalSlide === true;
      const isContentSlide = !isTitleSlide && !isFinalSlide;
      
      // Safe margins: TikTok needs more space for UI overlays
      const marginPercent = isTikTok ? 0.12 : 0.08;
      const marginX = CANVAS_WIDTH * marginPercent;
      const marginY = CANVAS_HEIGHT * marginPercent;

      // Draw background image
      if (backgroundImage) {
        // Cover the canvas while maintaining aspect ratio
        const imgRatio = backgroundImage.width / backgroundImage.height;
        const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgRatio > canvasRatio) {
          drawHeight = CANVAS_HEIGHT;
          drawWidth = backgroundImage.width * (CANVAS_HEIGHT / backgroundImage.height);
          drawX = (CANVAS_WIDTH - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = CANVAS_WIDTH;
          drawHeight = backgroundImage.height * (CANVAS_WIDTH / backgroundImage.width);
          drawX = 0;
          drawY = (CANVAS_HEIGHT - drawHeight) / 2;
        }
        
        ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);

        // Enhanced vignette for better text readability
        // Stronger overall darkening for TikTok
        const gradient = ctx.createRadialGradient(
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
          CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        gradient.addColorStop(0.4, isTikTok ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, isTikTok ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Add text zone protection - stronger gradient behind text area
        const textCenterY = isTikTok ? 0.40 : 0.48;
        const protectionHeight = CANVAS_HEIGHT * 0.45;
        const protectionY = CANVAS_HEIGHT * textCenterY - protectionHeight / 2;
        
        const textProtectionGradient = ctx.createLinearGradient(0, protectionY, 0, protectionY + protectionHeight);
        textProtectionGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        textProtectionGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.6)');
        textProtectionGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.6)');
        textProtectionGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = textProtectionGradient;
        ctx.fillRect(0, protectionY, CANVAS_WIDTH, protectionHeight);
      }

      const maxTextWidth = CANVAS_WIDTH - (marginX * 2.5);
      const maxSublineWidth = CANVAS_WIDTH - (marginX * 2.8);

      // Text settings
      const textColor = slide.textColor || '#FFFFFF';
      const accentColor = slide.accentColor || '#FF6B35';
      // Title slide shows subline only if explicitly enabled
      // Final slide always shows subline (CTA subtitle)
      // Content slides respect showSubline setting
      const showSubline = isFinalSlide 
        ? slide.subline 
        : isTitleSlide 
          ? slide.titleShowSubtitle && slide.subline
          : slide.showSubline !== false && slide.subline;

      // Render headline with highlight
      const headline = cleanText(slide.headline);
      const highlightWord = cleanText(slide.highlightWord);
      
      // Platform-specific font sizing - significantly larger for instant readability
      let maxHeadlineSize, minHeadlineSize;
      if (isTitleSlide) {
        // Title slide: massive font for maximum impact
        maxHeadlineSize = isTikTok ? 130 : 135;
        minHeadlineSize = isTikTok ? 85 : 90;
      } else if (isFinalSlide) {
        // Final slide (CTA): prominent and clear
        maxHeadlineSize = isTikTok ? 105 : 115;
        minHeadlineSize = isTikTok ? 70 : 75;
      } else {
        // Content slides: larger for better scroll-stop
        maxHeadlineSize = isTikTok ? 95 : 105;
        minHeadlineSize = isTikTok ? 60 : 65;
      }
      
      // Calculate optimal font size for headline
      let headlineFontSize = maxHeadlineSize;
      ctx.font = `800 ${headlineFontSize}px Inter, system-ui, sans-serif`;
      
      // Auto-scale headline if too wide
      while (ctx.measureText(headline).width > maxTextWidth && headlineFontSize > minHeadlineSize) {
        headlineFontSize -= 3;
        ctx.font = `800 ${headlineFontSize}px Inter, system-ui, sans-serif`;
      }

      // Split headline for word-by-word rendering
      const words = headline.split(' ');
      
      // Platform-specific vertical positioning - positioned higher for TikTok
      let centerY;
      if (isTitleSlide) {
        // Title slide: positioned higher for immediate impact
        centerY = isTikTok ? CANVAS_HEIGHT * 0.36 : CANVAS_HEIGHT * 0.43;
      } else if (isFinalSlide) {
        // Final slide (CTA): slightly higher than center
        centerY = isTikTok ? CANVAS_HEIGHT * 0.45 : CANVAS_HEIGHT * 0.48;
      } else {
        // Content slides: positioned higher for better visibility
        centerY = isTikTok ? CANVAS_HEIGHT * 0.40 : CANVAS_HEIGHT * 0.46;
      }
      
      // Calculate total width to center the text
      let totalWidth = 0;
      const wordWidths = words.map(word => {
        const width = ctx.measureText(word + ' ').width;
        return width;
      });
      totalWidth = wordWidths.reduce((a, b) => a + b, 0) - ctx.measureText(' ').width;

      // Check if we need to wrap to multiple lines
      const needsWrap = totalWidth > maxTextWidth;
      
      if (needsWrap) {
        // Multi-line rendering
        const lines = [];
        let currentLine = '';
        let currentWidth = 0;
        
        words.forEach((word, i) => {
          const wordWidth = ctx.measureText(word + ' ').width;
          if (currentWidth + wordWidth > maxTextWidth && currentLine) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
            currentWidth = wordWidth;
          } else {
            currentLine += word + ' ';
            currentWidth += wordWidth;
          }
        });
        if (currentLine) lines.push(currentLine.trim());

        const lineHeight = headlineFontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let lineY = centerY - totalHeight / 2 + headlineFontSize * 0.35;

        lines.forEach((line) => {
          const lineWords = line.split(' ');
          const lineWidth = ctx.measureText(line).width;
          let wordX = (CANVAS_WIDTH - lineWidth) / 2;

          let highlightUsed = false;
          lineWords.forEach((word) => {
            const isHighlight = !highlightUsed && word.toLowerCase() === highlightWord.toLowerCase();
            if (isHighlight) highlightUsed = true;
            
            // Enhanced shadow with stroke for maximum readability
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 8;
            ctx.strokeText(word, wordX, lineY);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillText(word, wordX + 3, lineY + 3);
            
            // Draw word
            ctx.fillStyle = isHighlight ? accentColor : textColor;
            ctx.fillText(word, wordX, lineY);
            
            wordX += ctx.measureText(word + ' ').width;
          });
          
          lineY += lineHeight;
        });
      } else {
        // Single line rendering
        let startX = (CANVAS_WIDTH - totalWidth) / 2;
        
        let highlightUsed = false;
        words.forEach((word, i) => {
          const isHighlight = !highlightUsed && word.toLowerCase() === highlightWord.toLowerCase();
          if (isHighlight) highlightUsed = true;
          
          // Enhanced shadow with stroke for maximum readability
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 8;
          ctx.strokeText(word, startX, centerY);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillText(word, startX + 3, centerY + 3);
          
          // Draw word
          ctx.fillStyle = isHighlight ? accentColor : textColor;
          ctx.fillText(word, startX, centerY);
          
          startX += ctx.measureText(word + ' ').width;
        });
      }

      // Render subline (if enabled) - multi-line support
      if (showSubline) {
        const subline = cleanText(slide.subline);
        // Significantly larger for TikTok readability
        const baseFontSize = isTikTok ? 62 : 64;
        const sublineFontSize = baseFontSize;
        ctx.font = `600 ${sublineFontSize}px Inter, system-ui, sans-serif`;
        
        // Auto-scale subline if needed
        let actualSublineSize = sublineFontSize;
        const testWidth = ctx.measureText(subline).width;
        while (testWidth > maxSublineWidth * 3 && actualSublineSize > 28) {
          actualSublineSize -= 2;
          ctx.font = `500 ${actualSublineSize}px Inter, system-ui, sans-serif`;
        }

        // Wrap subline into multiple lines
        const sublineWords = subline.split(' ');
        const sublineLines = [];
        let currentLine = '';
        let currentWidth = 0;

        sublineWords.forEach((word) => {
          const wordWidth = ctx.measureText(word + ' ').width;
          if (currentWidth + wordWidth > maxSublineWidth && currentLine) {
            sublineLines.push(currentLine.trim());
            currentLine = word + ' ';
            currentWidth = wordWidth;
          } else {
            currentLine += word + ' ';
            currentWidth += wordWidth;
          }
        });
        if (currentLine) sublineLines.push(currentLine.trim());

        // Starting Y position - much closer to headline for visual hierarchy
        let sublineY = centerY + headlineFontSize + (isTikTok ? 22 : 28);
        const lineHeight = actualSublineSize * 1.35;

        sublineLines.forEach((line) => {
          const lineWidth = ctx.measureText(line).width;
          const lineX = (CANVAS_WIDTH - lineWidth) / 2;

          // Extra strong contrast: thick stroke + shadow
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.lineWidth = 7;
          ctx.strokeText(line, lineX, sublineY);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillText(line, lineX + 2, sublineY + 2);
          
          // Draw subline - slightly more opaque
          ctx.fillStyle = textColor;
          ctx.globalAlpha = 0.92;
          ctx.fillText(line, lineX, sublineY);
          ctx.globalAlpha = 1;

          sublineY += lineHeight;
        });
      }

      // Slide numbering (if enabled) - shown on ALL slides including title and CTA
      const shouldShowNumber = slide.numberContentSlides && slide.totalSlides;

      if (shouldShowNumber) {
        const displayTotal = slide.totalSlides;
        const progressText = slide.progressStyle === 'of' 
          ? `${slide.index} of ${displayTotal}`
          : `${slide.index} / ${displayTotal}`;

        // Larger, highly visible font size
        const progressFontSize = isTikTok ? 52 : 56;
        ctx.font = `800 ${progressFontSize}px Inter, system-ui, sans-serif`;

        const progressMetrics = ctx.measureText(progressText);
        const progressWidth = progressMetrics.width;

        // Position: centered bottom with generous spacing
        const pillPaddingX = 38;
        const pillPaddingY = 20;
        const pillHeight = progressFontSize + (pillPaddingY * 2);
        const pillWidth = progressWidth + (pillPaddingX * 2);

        const pillX = (CANVAS_WIDTH - pillWidth) / 2;
        const pillY = CANVAS_HEIGHT - marginY - pillHeight - 40;

        // Draw progress background pill with maximum visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 28);
        ctx.fill();

        // Strong border with accent color for attention
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        const textX = pillX + pillPaddingX;
        const textY = pillY + pillPaddingY + progressFontSize * 0.75;

        // Strong shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(progressText, textX + 3, textY + 3);

        // Draw progress text in white
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 1;
        ctx.fillText(progressText, textX, textY);
        ctx.globalAlpha = 1;
      }
    };

    // Load background image
    if (slide.backgroundUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageLoaded(true);
        renderSlide(img);
      };
      img.onerror = () => {
        // Render without background on error
        renderSlide(null);
      };
      img.src = slide.backgroundUrl;
    } else {
      renderSlide(null);
    }
  }, [slide, index]);

  // Clean text of any markdown or special characters
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\n/g, ' ')
      .trim();
  };

  return (
    <canvas
      ref={canvasRef}
      id={`slide-canvas-${index}`}
      className="w-full h-full object-contain"
      style={{ imageRendering: 'high-quality' }}
    />
  );
}