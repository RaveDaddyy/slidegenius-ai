import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Download, Sparkles } from 'lucide-react';
import InputForm from '@/components/slideshow/InputForm';
import PreviewGallery from '@/components/slideshow/PreviewGallery';
import SlideEditor from '@/components/slideshow/SlideEditor';
import { generateImage, invokeLLM } from '@/api/functions';
import { supabase } from '@/api/supabaseClient';

export default function SlideGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);

  const stylePresets = {
    'cinematic-dark': {
      bgPrompt: 'cinematic dark moody atmosphere, deep shadows, subtle lighting, professional photography',
      textColor: '#FFFFFF',
      bgBase: '#0A0A0A'
    },
    'minimal-light': {
      bgPrompt: 'minimal clean bright white background, soft natural lighting, airy ethereal atmosphere',
      textColor: '#1A1A1A',
      bgBase: '#F5F5F5'
    },
    'warm-editorial': {
      bgPrompt: 'warm golden hour lighting, editorial magazine style, rich warm tones, sophisticated ambiance',
      textColor: '#FFFFFF',
      bgBase: '#2A1810'
    }
  };

  const generateSlides = async (formData) => {
    setIsGenerating(true);
    setSlides([]);
    setSettings(formData);

    try {
      // Determine slide structure
      const numContentAndTitleSlides = formData.slideCount;
      const hasFinalSlide = formData.showFinalSlide === true;
      const actualTotalSlides = hasFinalSlide ? numContentAndTitleSlides + 1 : numContentAndTitleSlides;
      
      // Step 1: Generate text content
      setGenerationStep(`Creating ${formData.platform === 'tiktok' ? 'TikTok' : 'Instagram'} content for ${actualTotalSlides} slides...`);
      
      // Build platform-specific text generation rules
      const platformRules = formData.platform === 'tiktok' 
        ? `- TIKTOK RULES: Headlines must be VERY SHORT - target 2-5 words, MAX 22 characters
- Punch hard and fast - people scroll fast on TikTok
- SLIDE 1 MUST BE A HOOK/TITLE - extremely short (2-4 words), no subtitle
- Slides 2-${numContentAndTitleSlides} are content/explanation slides
- Sublines optional and brief (${formData.showSubline ? 'ENABLED for slides 2+' : 'DISABLED'})` 
        : `- INSTAGRAM RULES: Headlines can be 3-7 words, max ~35 characters
- More context allowed
- SLIDE 1 is the title/hook
- Slides 2-${numContentAndTitleSlides} are content slides
- Sublines help tell the story (${formData.showSubline ? 'ENABLED' : 'DISABLED'})`;

      const hookRules = formData.hookMode 
        ? `- HOOK MODE ACTIVE: Use scroll-stopping hook patterns that convey CONSEQUENCE or RELEVANCE:
      * "Most people miss this"
      * "If you ignore this..."
      * "This changes everything"
      * "Stop before it's too late"
      * "The real reason you fail"
      * "Nobody tells you this"
      - Must be meaningful, not just clickbait - convey immediate value or consequence`
        : `- INFORMATIONAL MODE: Headlines must be IMPACTFUL and VALUE-DRIVEN
      - Not just descriptive - show relevance, benefit, or transformation
      - Examples: "Your morning ritual" → "The 5am advantage" | "Good habits" → "Habits that compound"`;

      let densityRules;
      if (formData.textDensity === 'ultra-short') {
        densityRules = '- Headline Style: ULTRA-SHORT - maximum impact with 1-3 words, extremely punchy and memorable';
      } else if (formData.textDensity === 'standard') {
        densityRules = '- Headline Style: STANDARD - balanced approach with 4-8 words, clear and impactful';
      } else if (formData.textDensity === 'question-based') {
        densityRules = '- Headline Style: QUESTION-BASED - formulate headlines as engaging questions that speak directly to the audience (variable length, but keep concise)';
      }

      let sublineRules = '';
      if (formData.showSubline) {
        let styleRule = '';
        if (formData.sublineStyle === 'explanatory') {
          styleRule = 'EXPLANATORY & SUPPORTIVE - provide additional context or a brief explanation that supports the headline';
        } else if (formData.sublineStyle === 'concise') {
          styleRule = 'CONCISE & PUNCHY - very brief sublines (3-5 words) that amplify or reinforce the headline as a mini-hook';
        } else if (formData.sublineStyle === 'action-oriented') {
          styleRule = 'ACTION-ORIENTED - sublines that prompt thinking or ask direct questions to encourage interaction';
        }

        let lengthRule = '';
        if (formData.sublineLength === 'short') {
          lengthRule = '1-2 short sentences (about 10-20 words total)';
        } else if (formData.sublineLength === 'medium') {
          lengthRule = '3-4 sentences or 30-50 words - provide more context and detail';
        } else if (formData.sublineLength === 'long') {
          lengthRule = '5-8 sentences or 60-100 words - write comprehensive explanations with multiple sentences that tell a complete story';
        }

        sublineRules = `- Subline Style: ${styleRule}\n- Subline Length: ${lengthRule}\n- IMPORTANT: Generate actual multi-sentence text, not just a single short phrase. Use multiple complete sentences to reach the target word count.`;
      }
      
      // Detect if topic is a numbered list (e.g., "5 habits", "7 ways", "10 tips")
      const isNumberedList = /(\d+)\s+(habits|ways|tips|steps|reasons|things|secrets|rules|keys|strategies|methods|lessons)/i.test(formData.topic);
      
      const textPrompt = `You are a professional copywriter for ${formData.platform === 'tiktok' ? 'TikTok' : 'Instagram'} slideshows.
Create exactly ${numContentAndTitleSlides} slides about: "${formData.topic}"

SLIDE STRUCTURE:
- Slide 1: Title/Hook slide - ${formData.titleTextSource === 'exact' ? 'use the topic EXACTLY as provided' : 'create optimized scroll-stopping hook (2-4 words)'}
- Slides 2-${numContentAndTitleSlides}: Content/explanation slides that deliver value
${hasFinalSlide ? '- Note: Final CTA slide will be added separately' : ''}
${isNumberedList ? `\n- IMPORTANT: This is a numbered list topic! For slides 2 to ${numContentAndTitleSlides}, prefix EACH content slide headline with its corresponding number starting from 1 (e.g., "1. First Point", "2. Second Point", "3. Third Point", etc.)` : ''}

CRITICAL RULES:
${platformRules}
${hookRules}
${densityRules}
${sublineRules}
- highlightWord must be exactly ONE word from the headline that emphasizes the key point
- ABSOLUTELY NO markdown symbols: no **, no *, no _, no [], no formatting characters
- Clean text only - highlighting is handled separately
- Slide 1: ${formData.titleShowSubtitle ? 'Include SHORT subtitle that adds intrigue' : 'NO subline (leave empty)'}
- Slides 2+: ${formData.showSubline ? 'Generate sublines according to the specified style and length rules above' : 'NO sublines'}

Return ONLY valid JSON in this exact format:
{
  "slides": [
    {"index": 1, "headline": "${formData.titleTextSource === 'exact' ? formData.topic : 'Stop Scrolling'}", "highlightWord": "Stop", "subline": "${formData.titleShowSubtitle ? 'Optional subtitle' : ''}"},
    {"index": 2, "headline": "First Key Point", "highlightWord": "Key", "subline": "Clear explanation here"}
  ]
}`;

      const textResult = await invokeLLM({
        prompt: textPrompt,
        response_json_schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  index: { type: "number" },
                  headline: { type: "string" },
                  highlightWord: { type: "string" },
                  subline: { type: "string" }
                },
                required: ["index", "headline", "highlightWord", "subline"]
              }
            }
          },
          required: ["slides"]
        }
      });

      const slideContent = textResult.slides.slice(0, numContentAndTitleSlides);
      
      // Ensure we have exactly the right number of content and title slides
      while (slideContent.length < numContentAndTitleSlides) {
        slideContent.push({
          index: slideContent.length + 1,
          headline: `Slide ${slideContent.length + 1}`,
          highlightWord: "Slide",
          subline: "Additional content slide"
        });
      }
      
      // Add final slide (CTA) if needed - this is ADDITIONAL to slideCount
      if (hasFinalSlide) {
        slideContent.push({
          index: actualTotalSlides,
          headline: formData.ctaText,
          highlightWord: formData.ctaText.split(' ')[0],
          subline: formData.ctaSubtitle,
          isFinalSlide: true
        });
      }

      // Step 2: Generate background images for each slide
      const preset = stylePresets[formData.stylePreset];
      const generatedSlides = [];

      for (let i = 0; i < slideContent.length; i++) {
        const slide = slideContent[i];
        setGenerationStep(`Generating background ${i + 1} of ${actualTotalSlides}...`);

        let imagePrompt;
        
        if (formData.backgroundRelevance) {
          // Background matches the meaning of the slide
          imagePrompt = `Create a vertical 9:16 background image for social media.
Theme: ${slide.headline} - ${slide.subline}
Style: ${preset.bgPrompt}
CRITICAL REQUIREMENTS:
- Strong center negative space for text overlay (center 40% must be relatively empty)
- No text, no letters, no logos, no watermarks, no symbols
- Visual metaphor or scene that represents the concept
- Professional, premium quality
- Vertical composition optimized for mobile`;
        } else {
          // Generic cinematic backgrounds
          const genericThemes = [
            'abstract light rays and soft gradients',
            'subtle smoke and atmospheric fog',
            'geometric abstract shapes with depth',
            'soft bokeh lights and blur',
            'textured gradient with subtle patterns',
            'ethereal clouds and atmosphere',
            'minimalist abstract composition'
          ];
          const theme = genericThemes[i % genericThemes.length];
          
          imagePrompt = `Create a vertical 9:16 background image for social media.
Style: ${preset.bgPrompt}, ${theme}
CRITICAL REQUIREMENTS:
- Strong center negative space for text overlay (center 40% must be clean and empty)
- No text, no letters, no logos, no watermarks, no symbols
- Abstract, cinematic, premium quality
- Consistent style, not illustrating any specific concept
- Vertical composition optimized for mobile`;
        }

        const imageResult = await generateImage({
          prompt: imagePrompt
        });

        generatedSlides.push({
          ...slide,
          backgroundUrl: imageResult.url,
          accentColor: formData.accentColor,
          stylePreset: formData.stylePreset,
          textColor: preset.textColor,
          platform: formData.platform,
          instagramFormat: formData.instagramFormat,
          showSubline: formData.showSubline,
          numberContentSlides: formData.numberContentSlides,
          progressStyle: formData.progressStyle,
          totalSlides: actualTotalSlides,
          titleShowSubtitle: formData.titleShowSubtitle
        });

        // Update state progressively so user sees slides as they generate
        setSlides([...generatedSlides]);
      }

      setGenerationStep('');
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Generation error:', message, error);
      setGenerationStep(`Error generating slides: ${message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideEdit = (slide, index) => {
    setEditingSlide({ slide, index });
  };

  const handleSaveSlideEdit = (editedSlide) => {
    setSlides(prev => prev.map((s, i) => 
      i === editingSlide.index ? editedSlide : s
    ));
    setEditingSlide(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Slide Studio</h1>
                <p className="text-sm text-white/40">Design-ready social slides in seconds</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[400px,1fr] gap-12">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <InputForm 
              onGenerate={generateSlides} 
              isGenerating={isGenerating}
            />
          </motion.div>

          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="min-h-[600px]"
          >
            <AnimatePresence mode="wait">
              {isGenerating && slides.length === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
                    <Loader2 className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-white/60 text-sm">{generationStep}</p>
                </motion.div>
              ) : slides.length > 0 ? (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <>
                    <PreviewGallery 
                      slides={slides} 
                      isGenerating={isGenerating}
                      generationStep={generationStep}
                      platform={settings?.platform}
                      onSlideEdit={handleSlideEdit}
                    />
                    {editingSlide && (
                      <SlideEditor
                        slide={editingSlide.slide}
                        onSave={handleSaveSlideEdit}
                        onCancel={() => setEditingSlide(null)}
                      />
                    )}
                  </>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-24 h-32 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
                    <span className="text-white/20 text-4xl">9:16</span>
                  </div>
                  <h3 className="text-lg font-medium text-white/60 mb-2">Your slides will appear here</h3>
                  <p className="text-sm text-white/30 max-w-xs">
                    Enter a topic and customize your settings to generate design-ready slides
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
