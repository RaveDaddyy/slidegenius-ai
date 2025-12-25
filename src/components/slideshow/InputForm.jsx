import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image, Palette, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import InfoTooltip from './InfoTooltip';

export default function InputForm({ onGenerate, isGenerating }) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(7);
  const [platform, setPlatform] = useState('tiktok');
  const [instagramFormat, setInstagramFormat] = useState('4:5'); // '4:5' or '1:1'
  const [hookMode, setHookMode] = useState(false);
  const [numberContentSlides, setNumberContentSlides] = useState(true);
  const [progressStyle, setProgressStyle] = useState('slash');
  const [backgroundRelevance, setBackgroundRelevance] = useState(true);
  const [textDensity, setTextDensity] = useState('ultra-short');
  const [sublineStyle, setSublineStyle] = useState('explanatory');
  const [sublineLength, setSublineLength] = useState('short');
  const [showSubline, setShowSubline] = useState(true);
  const [stylePreset, setStylePreset] = useState('cinematic-dark');
  const [accentColor, setAccentColor] = useState('#FF6B35');
  
  // Title slide controls
  const [titleTextSource, setTitleTextSource] = useState('optimized'); // 'exact' or 'optimized'
  const [titleShowSubtitle, setTitleShowSubtitle] = useState(false);
  
  // Final slide CTA controls
  const [showFinalSlide, setShowFinalSlide] = useState(true);
  const [ctaText, setCtaText] = useState('Link in bio');
  const [ctaSubtitle, setCtaSubtitle] = useState('Follow for more');

  // Apply platform presets
  React.useEffect(() => {
    if (platform === 'tiktok') {
      setTextDensity('ultra-short');
      setNumberContentSlides(true);
    } else if (platform === 'instagram') {
      setTextDensity('standard');
      setNumberContentSlides(true);
    }
  }, [platform]);

  const presetColors = [
    { color: '#FF6B35', name: 'Orange' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#10B981', name: 'Emerald' },
    { color: '#F59E0B', name: 'Amber' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#8B5CF6', name: 'Purple' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic,
      slideCount,
      platform,
      hookMode,
      numberContentSlides,
      progressStyle,
      backgroundRelevance,
      textDensity,
      sublineStyle,
      sublineLength,
      showSubline,
      stylePreset,
      accentColor,
      titleTextSource,
      titleShowSubtitle,
      showFinalSlide,
      ctaText,
      ctaSubtitle,
      instagramFormat
      });
      };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic Input */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">1</span>
          Topic / Core Message
          <InfoTooltip 
            title="Topic / Core Message"
            description="The main theme of your slideshow. The more precise you are, the better the results. AI will automatically create headlines and content for all slides based on this."
            example="'5 habits of successful people' or 'Why you should meditate daily'"
          />
        </Label>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., 5 habits of highly successful people"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
        />
      </div>

      {/* Platform Toggle */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">2</span>
          Platform
          <InfoTooltip 
            title="Platform"
            description="TikTok and Instagram have different best practices. TikTok prefers ultra-short, punchy headlines (2-5 words), Instagram allows slightly more context (3-7 words)."
            example="TikTok: 'Stop Scrolling' | Instagram: 'Why You Should Stop Now'"
          />
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPlatform('tiktok')}
            className={`p-4 rounded-xl border transition-all ${
              platform === 'tiktok'
                ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-left">
              <p className={`text-sm font-semibold ${platform === 'tiktok' ? 'text-white' : 'text-white/60'}`}>
                TikTok
              </p>
              <p className="text-xs text-white/40 mt-1">Quick hooks, max impact</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('instagram')}
            className={`p-4 rounded-xl border transition-all ${
              platform === 'instagram'
                ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-left">
              <p className={`text-sm font-semibold ${platform === 'instagram' ? 'text-white' : 'text-white/60'}`}>
                Instagram
              </p>
              <p className="text-xs text-white/40 mt-1">More context, polished</p>
            </div>
            </button>
            </div>
            </div>

            {/* Instagram Format Selection */}
            {platform === 'instagram' && (
              <div className="space-y-3">
                <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
                  Instagram Format
                  <InfoTooltip 
                    title="Instagram Format"
                    description="4:5 (Portrait) is the standard feed format for Instagram and uses the most space. 1:1 (Square) works well for carousels and looks balanced."
                    example="4:5 = 1080x1350px | 1:1 = 1080x1080px"
                  />
                </Label>
            <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInstagramFormat('4:5')}
              className={`p-4 rounded-xl border transition-all ${
                instagramFormat === '4:5'
                  ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${instagramFormat === '4:5' ? 'text-white' : 'text-white/60'}`}>
                  4:5 Portrait
                </p>
                <p className="text-xs text-white/40 mt-1">1080 x 1350 px</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setInstagramFormat('1:1')}
              className={`p-4 rounded-xl border transition-all ${
                instagramFormat === '1:1'
                  ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-semibold ${instagramFormat === '1:1' ? 'text-white' : 'text-white/60'}`}>
                  1:1 Square
                </p>
                <p className="text-xs text-white/40 mt-1">1080 x 1080 px</p>
              </div>
            </button>
            </div>
            </div>
            )}

            {/* Slide Count */}
            <div className="space-y-4">
              <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">3</span>
                Number of Slides
                <InfoTooltip 
                  title="Number of Slides"
                  description="Number of title and content slides (3-15). If 'Include Final CTA Slide' is enabled, an additional slide will be added to this total."
                  example="7 Slides = 1 Title + 6 Content (+ CTA is extra if enabled)"
                />
              </Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[slideCount]}
            onValueChange={(val) => setSlideCount(val[0])}
            min={3}
            max={15}
            step={1}
            className="flex-1"
          />
          <div className="w-14 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white font-semibold">
            {slideCount}
          </div>
        </div>
      </div>

      {/* Title Slide Controls */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">4</span>
          Title Slide (Slide 1)
          <InfoTooltip 
            title="Title Slide (Slide 1)"
            description="The first slide is your hook - it decides whether users keep scrolling or stay. 'Exact Input' uses your topic 1:1, 'Optimized Hook' creates a scroll-stopping teaser."
            example="Exact: 'The 5 best morning routines' | Optimized: 'Stop Scrolling'"
          />
        </Label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTitleTextSource('exact')}
              className={`p-3 rounded-lg border text-sm transition-all ${
                titleTextSource === 'exact'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              Exact Input
            </button>
            <button
              type="button"
              onClick={() => setTitleTextSource('optimized')}
              className={`p-3 rounded-lg border text-sm transition-all ${
                titleTextSource === 'optimized'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              Optimized Hook
            </button>
          </div>
          <button
            type="button"
            onClick={() => setTitleShowSubtitle(!titleShowSubtitle)}
            className={`w-full p-3 rounded-lg border text-sm transition-all ${
              titleShowSubtitle
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            {titleShowSubtitle ? '✓ Show Title Subtitle' : 'Hide Title Subtitle'}
          </button>
        </div>
      </div>

      {/* Hook Mode Toggle */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">5</span>
          Content Slides Hook Mode
          <InfoTooltip 
            title="Content Slides Hook Mode"
            description="Hook Mode creates attention-grabbing headlines with psychological triggers ('Most people miss this'). Informational Mode is factual and direct."
            example="Hook: 'If you ignore this...' | Info: 'The first key habit'"
          />
        </Label>
        <button
          type="button"
          onClick={() => setHookMode(!hookMode)}
          className={`w-full p-4 rounded-xl border transition-all ${
            hookMode 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-5 h-5 ${hookMode ? 'text-orange-400' : 'text-white/40'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${hookMode ? 'text-white' : 'text-white/60'}`}>
                  {hookMode ? 'Scroll-Stopping Hooks' : 'Informational Style'}
                </p>
                <p className="text-xs text-white/40">
                  {hookMode 
                    ? 'Force attention-grabbing headlines' 
                    : 'Clean, straightforward headlines'}
                </p>
              </div>
            </div>
            {hookMode ? (
              <ToggleRight className="w-8 h-8 text-orange-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-white/30" />
            )}
          </div>
        </button>
      </div>

      {/* Slide Numbering Toggle */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">6</span>
          Slide Numbering
          <InfoTooltip 
            title="Slide Numbering"
            description="Shows progress indicators on content slides (e.g. '2/7'). The title slide and final CTA slide are not numbered. Choose between '2/7' or '2 of 7' style."
            example="Slide 2 shows '2/7', Slide 3 shows '3/7', etc."
          />
        </Label>
        <button
          type="button"
          onClick={() => setNumberContentSlides(!numberContentSlides)}
          className={`w-full p-4 rounded-xl border transition-all ${
            numberContentSlides 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className={`w-5 h-5 ${numberContentSlides ? 'text-orange-400' : 'text-white/40'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${numberContentSlides ? 'text-white' : 'text-white/60'}`}>
                  {numberContentSlides ? 'Number Content Slides' : 'No Slide Numbers'}
                </p>
                <p className="text-xs text-white/40">
                  {numberContentSlides ? 'Show 1/N, 2/N... on all slides' : 'No numbering on any slide'}
                </p>
              </div>
            </div>
            {numberContentSlides ? (
              <ToggleRight className="w-8 h-8 text-orange-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-white/30" />
            )}
          </div>
        </button>

        {numberContentSlides && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => setProgressStyle('slash')}
              className={`p-3 rounded-lg border text-sm transition-all ${
                progressStyle === 'slash'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              2/5 style
            </button>
            <button
              type="button"
              onClick={() => setProgressStyle('of')}
              className={`p-3 rounded-lg border text-sm transition-all ${
                progressStyle === 'of'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              2 of 5 style
            </button>
          </div>
        )}
      </div>

      {/* Text Density & Subline */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">7</span>
          Content Slides Text
          <InfoTooltip 
            title="Content Slides Text"
            description="Headline Style controls the format and length of your main text. Subline Style determines how the supporting text complements the headline."
            example="Ultra-Short: '1-3 words' | Question-Based: 'Why does this matter?'"
          />
        </Label>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-white/60 text-xs">Headline Style</Label>
            <Select value={textDensity} onValueChange={setTextDensity}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                <SelectItem value="ultra-short" className="text-white focus:bg-white/10 focus:text-white">
                  Ultra-Short (1-3 words)
                </SelectItem>
                <SelectItem value="standard" className="text-white focus:bg-white/10 focus:text-white">
                  Standard (4-8 words)
                </SelectItem>
                <SelectItem value="question-based" className="text-white focus:bg-white/10 focus:text-white">
                  Question-Based (variable)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => setShowSubline(!showSubline)}
            className={`w-full p-3 rounded-lg border text-sm transition-all ${
              showSubline
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            {showSubline ? '✓ Show Subline' : 'Hide Subline'}
          </button>
          {showSubline && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-white/60 text-xs">Subline Style</Label>
                <Select value={sublineStyle} onValueChange={setSublineStyle}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    <SelectItem value="explanatory" className="text-white focus:bg-white/10 focus:text-white">
                      Explanatory & Supportive
                    </SelectItem>
                    <SelectItem value="concise" className="text-white focus:bg-white/10 focus:text-white">
                      Concise & Punchy
                    </SelectItem>
                    <SelectItem value="action-oriented" className="text-white focus:bg-white/10 focus:text-white">
                      Action-Oriented
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-white/60 text-xs">Subline Length</Label>
                <Select value={sublineLength} onValueChange={setSublineLength}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    <SelectItem value="short" className="text-white focus:bg-white/10 focus:text-white">
                      Short (1-2 lines)
                    </SelectItem>
                    <SelectItem value="medium" className="text-white focus:bg-white/10 focus:text-white">
                      Medium (3-4 lines)
                    </SelectItem>
                    <SelectItem value="long" className="text-white focus:bg-white/10 focus:text-white">
                      Long (5-8 lines)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Final Slide CTA */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">8</span>
          Final Slide (CTA)
          <InfoTooltip 
            title="Final Slide (CTA)"
            description="The last slide is your call-to-action - ask the viewer to take action. Classic: 'Link in Bio' or 'Follow for more'."
            example="'Link in Bio' + 'Follow for more tips'"
          />
        </Label>
        <button
          type="button"
          onClick={() => setShowFinalSlide(!showFinalSlide)}
          className={`w-full p-4 rounded-xl border transition-all ${
            showFinalSlide 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className={`w-5 h-5 ${showFinalSlide ? 'text-orange-400' : 'text-white/40'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${showFinalSlide ? 'text-white' : 'text-white/60'}`}>
                  {showFinalSlide ? 'Include Final CTA Slide' : 'No Final CTA Slide'}
                </p>
                <p className="text-xs text-white/40">
                  {showFinalSlide ? 'Last slide with call-to-action' : 'End with last content slide'}
                </p>
              </div>
            </div>
            {showFinalSlide ? (
              <ToggleRight className="w-8 h-8 text-orange-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-white/30" />
            )}
          </div>
        </button>
        {showFinalSlide && (
          <div className="space-y-2">
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Link in bio"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            <Input
              value={ctaSubtitle}
              onChange={(e) => setCtaSubtitle(e.target.value)}
              placeholder="e.g., Follow for more"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        )}
      </div>

      {/* Background Relevance Toggle */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">9</span>
          Background Relevance
          <InfoTooltip 
            title="Background Relevance"
            description="Content-Matched: Each slide gets an individual background image that matches its meaning. Generic: All slides use similar cinematic backgrounds for a consistent look."
            example="Content-Matched: Slide about 'Meditation' shows yoga scene | Generic: All slides use abstract gradients"
          />
        </Label>
        <button
          type="button"
          onClick={() => setBackgroundRelevance(!backgroundRelevance)}
          className={`w-full p-4 rounded-xl border transition-all ${
            backgroundRelevance 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className={`w-5 h-5 ${backgroundRelevance ? 'text-orange-400' : 'text-white/40'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${backgroundRelevance ? 'text-white' : 'text-white/60'}`}>
                  {backgroundRelevance ? 'Content-Matched' : 'Generic Cinematic'}
                </p>
                <p className="text-xs text-white/40">
                  {backgroundRelevance 
                    ? 'Backgrounds match each slide\'s meaning' 
                    : 'Consistent premium backgrounds'}
                </p>
              </div>
            </div>
            {backgroundRelevance ? (
              <ToggleRight className="w-8 h-8 text-orange-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-white/30" />
            )}
          </div>
        </button>
      </div>

      {/* Style Preset */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">10</span>
          Style Preset
          <InfoTooltip 
            title="Style Preset"
            description="Determines the visual style and mood of your slides. Cinematic Dark is moody and dramatic, Minimal Light is clean and bright, Warm Editorial is elegant and golden."
            example="Cinematic Dark: Dark shadows, dramatic lighting"
          />
        </Label>
        <Select value={stylePreset} onValueChange={setStylePreset}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-white/10">
            <SelectItem value="cinematic-dark" className="text-white focus:bg-white/10 focus:text-white">
              Cinematic Dark
            </SelectItem>
            <SelectItem value="minimal-light" className="text-white focus:bg-white/10 focus:text-white">
              Minimal Light
            </SelectItem>
            <SelectItem value="warm-editorial" className="text-white focus:bg-white/10 focus:text-white">
              Warm Editorial
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-medium flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-xs">11</span>
          Accent Color
          <InfoTooltip 
            title="Accent Color"
            description="The accent color is used to highlight words in headlines and create visual attention. Choose a color that matches your branding."
            example="Orange highlights the word 'Stop' in 'Stop Scrolling'"
          />
        </Label>
        <div className="flex items-center gap-2">
          {presetColors.map(({ color, name }) => (
            <button
              key={color}
              type="button"
              onClick={() => setAccentColor(color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                accentColor === color 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0A] scale-110' 
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
          <div className="relative ml-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0"
            />
            <div 
              className="w-10 h-10 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <Palette className="w-4 h-4 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate {showFinalSlide ? slideCount + 1 : slideCount} {platform === 'tiktok' ? 'TikTok' : `Instagram ${instagramFormat}`} Slides
            </span>
          )}
        </Button>
      </motion.div>
    </form>
  );
}