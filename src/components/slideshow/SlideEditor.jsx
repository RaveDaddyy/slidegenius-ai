import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function SlideEditor({ slide, onSave, onCancel }) {
  const [editedSlide, setEditedSlide] = useState({
    headline: slide.headline || '',
    subline: slide.subline || '',
    highlightWord: slide.highlightWord || '',
    showSubline: slide.showSubline !== false,
    numberContentSlides: slide.numberContentSlides !== false,
    progressStyle: slide.progressStyle || 'slash',
  });

  const isTitleSlide = slide.index === 1;
  const isFinalSlide = slide.isFinalSlide;
  const isContentSlide = !isTitleSlide && !isFinalSlide;

  const handleSave = () => {
    onSave({
      ...slide,
      ...editedSlide,
      edited: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Edit Slide {slide.index}
            </h3>
            <p className="text-sm text-white/40 mt-1">
              {isTitleSlide ? 'Title Slide' : isFinalSlide ? 'Final Slide (CTA)' : 'Content Slide'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Headline */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">
              {isFinalSlide ? 'CTA Text' : 'Headline'}
            </Label>
            <Textarea
              value={editedSlide.headline}
              onChange={(e) => setEditedSlide({ ...editedSlide, headline: e.target.value })}
              placeholder="Enter headline..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
            />
          </div>

          {/* Highlight Word */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Highlight Word</Label>
            <Input
              value={editedSlide.highlightWord}
              onChange={(e) => setEditedSlide({ ...editedSlide, highlightWord: e.target.value })}
              placeholder="One word from headline..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40">
              This word will be highlighted in the accent color
            </p>
          </div>

          {/* Subline Toggle & Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80 text-sm">
                {isFinalSlide ? 'CTA Subtitle' : 'Subtitle'}
              </Label>
              <Switch
                checked={editedSlide.showSubline}
                onCheckedChange={(checked) => setEditedSlide({ ...editedSlide, showSubline: checked })}
              />
            </div>
            {editedSlide.showSubline && (
              <Textarea
                value={editedSlide.subline}
                onChange={(e) => setEditedSlide({ ...editedSlide, subline: e.target.value })}
                placeholder="Enter subtitle..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] resize-none"
              />
            )}
          </div>

          {/* Slide Numbering (only for content slides) */}
          {isContentSlide && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Label className="text-white/80 text-sm">Slide Numbering</Label>
                <Switch
                  checked={editedSlide.numberContentSlides}
                  onCheckedChange={(checked) => setEditedSlide({ ...editedSlide, numberContentSlides: checked })}
                />
              </div>
              {editedSlide.numberContentSlides && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditedSlide({ ...editedSlide, progressStyle: 'slash' })}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      editedSlide.progressStyle === 'slash'
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    2/5 style
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditedSlide({ ...editedSlide, progressStyle: 'of' })}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      editedSlide.progressStyle === 'of'
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    2 of 5 style
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}