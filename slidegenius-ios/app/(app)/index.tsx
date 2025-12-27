import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import SlideCard, { Slide } from '@/components/SlideCard';
import { generateImage, invokeLLM } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const stylePresets = {
  'cinematic-dark': {
    bgPrompt: 'cinematic dark moody atmosphere, deep shadows, subtle lighting, professional photography',
    textColor: '#FFFFFF',
    bgBase: '#0A0A0A',
  },
  'minimal-light': {
    bgPrompt: 'minimal clean bright white background, soft natural lighting, airy ethereal atmosphere',
    textColor: '#1A1A1A',
    bgBase: '#F5F5F5',
  },
  'warm-editorial': {
    bgPrompt: 'warm golden hour lighting, editorial magazine style, rich warm tones, sophisticated ambiance',
    textColor: '#FFFFFF',
    bgBase: '#2A1810',
  },
};

const accentPresets = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

type FormState = {
  topic: string;
  slideCount: number;
  platform: 'tiktok' | 'instagram';
  instagramFormat: '4:5' | '1:1';
  hookMode: boolean;
  numberContentSlides: boolean;
  progressStyle: string;
  backgroundRelevance: boolean;
  textDensity: 'ultra-short' | 'standard' | 'question-based';
  sublineStyle: 'explanatory' | 'concise' | 'action-oriented';
  sublineLength: 'short' | 'medium' | 'long';
  showSubline: boolean;
  stylePreset: keyof typeof stylePresets;
  accentColor: string;
  titleTextSource: 'exact' | 'optimized';
  titleShowSubtitle: boolean;
  showFinalSlide: boolean;
  ctaText: string;
  ctaSubtitle: string;
};

const defaultForm: FormState = {
  topic: '',
  slideCount: 7,
  platform: 'tiktok',
  instagramFormat: '4:5',
  hookMode: false,
  numberContentSlides: true,
  progressStyle: 'slash',
  backgroundRelevance: true,
  textDensity: 'ultra-short',
  sublineStyle: 'explanatory',
  sublineLength: 'short',
  showSubline: true,
  stylePreset: 'cinematic-dark',
  accentColor: '#FF6B35',
  titleTextSource: 'optimized',
  titleShowSubtitle: false,
  showFinalSlide: true,
  ctaText: 'Link in bio',
  ctaSubtitle: 'Follow for more',
};

export default function SlideGeneratorScreen() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const captureRefs = useRef<Array<ViewShot | null>>([]);

  const preset = useMemo(() => stylePresets[form.stylePreset], [form.stylePreset]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!form.topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setSlides([]);

    try {
      const numContentAndTitleSlides = form.slideCount;
      const hasFinalSlide = form.showFinalSlide === true;
      const actualTotalSlides = hasFinalSlide ? numContentAndTitleSlides + 1 : numContentAndTitleSlides;

      setGenerationStep(
        `Creating ${form.platform === 'tiktok' ? 'TikTok' : 'Instagram'} content for ${actualTotalSlides} slides...`
      );

      const platformRules =
        form.platform === 'tiktok'
          ? `- TIKTOK RULES: Headlines must be VERY SHORT - target 2-5 words, MAX 22 characters
- Punch hard and fast - people scroll fast on TikTok
- SLIDE 1 MUST BE A HOOK/TITLE - extremely short (2-4 words), no subtitle
- Slides 2-${numContentAndTitleSlides} are content/explanation slides
- Sublines optional and brief (${form.showSubline ? 'ENABLED for slides 2+' : 'DISABLED'})`
          : `- INSTAGRAM RULES: Headlines can be 3-7 words, max ~35 characters
- More context allowed
- SLIDE 1 is the title/hook
- Slides 2-${numContentAndTitleSlides} are content slides
- Sublines help tell the story (${form.showSubline ? 'ENABLED' : 'DISABLED'})`;

      const hookRules = form.hookMode
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

      let densityRules = '';
      if (form.textDensity === 'ultra-short') {
        densityRules = '- Headline Style: ULTRA-SHORT - maximum impact with 1-3 words, extremely punchy and memorable';
      } else if (form.textDensity === 'standard') {
        densityRules = '- Headline Style: STANDARD - balanced approach with 4-8 words, clear and impactful';
      } else if (form.textDensity === 'question-based') {
        densityRules = '- Headline Style: QUESTION-BASED - formulate headlines as engaging questions that speak directly to the audience (variable length, but keep concise)';
      }

      let sublineRules = '';
      if (form.showSubline) {
        let styleRule = '';
        if (form.sublineStyle === 'explanatory') {
          styleRule = 'EXPLANATORY & SUPPORTIVE - provide additional context or a brief explanation that supports the headline';
        } else if (form.sublineStyle === 'concise') {
          styleRule = 'CONCISE & PUNCHY - very brief sublines (3-5 words) that amplify or reinforce the headline as a mini-hook';
        } else if (form.sublineStyle === 'action-oriented') {
          styleRule = 'ACTION-ORIENTED - sublines that prompt thinking or ask direct questions to encourage interaction';
        }

        let lengthRule = '';
        if (form.sublineLength === 'short') {
          lengthRule = '1-2 short sentences (about 10-20 words total)';
        } else if (form.sublineLength === 'medium') {
          lengthRule = '3-4 sentences or 30-50 words - provide more context and detail';
        } else if (form.sublineLength === 'long') {
          lengthRule = '5-8 sentences or 60-100 words - write comprehensive explanations with multiple sentences that tell a complete story';
        }

        sublineRules = `- Subline Style: ${styleRule}\n- Subline Length: ${lengthRule}\n- IMPORTANT: Generate actual multi-sentence text, not just a single short phrase. Use multiple complete sentences to reach the target word count.`;
      }

      const isNumberedList = /(\d+)\s+(habits|ways|tips|steps|reasons|things|secrets|rules|keys|strategies|methods|lessons)/i.test(
        form.topic
      );

      const textPrompt = `You are a professional copywriter for ${
        form.platform === 'tiktok' ? 'TikTok' : 'Instagram'
      } slideshows.
Create exactly ${numContentAndTitleSlides} slides about: "${form.topic}"

SLIDE STRUCTURE:
- Slide 1: Title/Hook slide - ${form.titleTextSource === 'exact' ? 'use the topic EXACTLY as provided' : 'create optimized scroll-stopping hook (2-4 words)'}
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
- Slide 1: ${form.titleShowSubtitle ? 'Include SHORT subtitle that adds intrigue' : 'NO subline (leave empty)'}
- Slides 2+: ${form.showSubline ? 'Generate sublines according to the specified style and length rules above' : 'NO sublines'}

Return ONLY valid JSON in this exact format:
{
  "slides": [
    {"index": 1, "headline": "${form.titleTextSource === 'exact' ? form.topic : 'Stop Scrolling'}", "highlightWord": "Stop", "subline": "${form.titleShowSubtitle ? 'Optional subtitle' : ''}"},
    {"index": 2, "headline": "First Key Point", "highlightWord": "Key", "subline": "Clear explanation here"}
  ]
}`;

      const textResult = await invokeLLM({
        prompt: textPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: { type: 'number' },
                  headline: { type: 'string' },
                  highlightWord: { type: 'string' },
                  subline: { type: 'string' },
                },
                required: ['index', 'headline', 'highlightWord', 'subline'],
              },
            },
          },
          required: ['slides'],
        },
      });

      const slideContent = textResult.slides.slice(0, numContentAndTitleSlides);

      while (slideContent.length < numContentAndTitleSlides) {
        slideContent.push({
          index: slideContent.length + 1,
          headline: `Slide ${slideContent.length + 1}`,
          highlightWord: 'Slide',
          subline: 'Additional content slide',
        });
      }

      if (hasFinalSlide) {
        slideContent.push({
          index: actualTotalSlides,
          headline: form.ctaText,
          highlightWord: form.ctaText.split(' ')[0] ?? form.ctaText,
          subline: form.ctaSubtitle,
          isFinalSlide: true,
        });
      }

      const generatedSlides: Slide[] = [];

      for (let i = 0; i < slideContent.length; i += 1) {
        const slide = slideContent[i];
        setGenerationStep(`Generating background ${i + 1} of ${actualTotalSlides}...`);

        let imagePrompt = '';
        if (form.backgroundRelevance) {
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
          const genericThemes = [
            'abstract light rays and soft gradients',
            'subtle smoke and atmospheric fog',
            'geometric abstract shapes with depth',
            'soft bokeh lights and blur',
            'textured gradient with subtle patterns',
            'ethereal clouds and atmosphere',
            'minimalist abstract composition',
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

        const imageResult = await generateImage({ prompt: imagePrompt });

        generatedSlides.push({
          ...slide,
          backgroundUrl: imageResult.url,
          accentColor: form.accentColor,
          stylePreset: form.stylePreset,
          textColor: preset.textColor,
          platform: form.platform,
          instagramFormat: form.instagramFormat,
          showSubline: form.showSubline,
          numberContentSlides: form.numberContentSlides,
          progressStyle: form.progressStyle,
          totalSlides: actualTotalSlides,
          titleShowSubtitle: form.titleShowSubtitle,
        });

        setSlides([...generatedSlides]);
      }

      setGenerationStep('');
    } catch (error) {
      setGenerationStep('Error generating slides. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleExportSlides = async () => {
    if (!slides.length || isExporting) return;
    setIsExporting(true);
    setExportStatus('');

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setExportStatus('Please allow photo access to export slides.');
        return;
      }

      for (let i = 0; i < slides.length; i += 1) {
        const ref = captureRefs.current[i];
        if (!ref) continue;
        setExportStatus(`Saving slide ${i + 1} of ${slides.length}...`);
        const uri = await ref.capture?.({ format: 'png', quality: 1 });
        if (uri) {
          await MediaLibrary.saveToLibraryAsync(uri);
        }
      }

      setExportStatus('Slides saved to your Photos.');
    } catch (error) {
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Slide Studio</Text>
          <Text style={styles.subtitle}>Design-ready social slides in seconds</Text>
        </View>
        <Pressable onPress={handleSignOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Topic</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., 5 habits of highly successful people"
            placeholderTextColor="#6B7280"
            multiline
            value={form.topic}
            onChangeText={(value) => updateForm('topic', value)}
          />

          <Text style={styles.sectionTitle}>Platform</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.choiceButton, form.platform === 'tiktok' && styles.choiceButtonActive]}
              onPress={() => updateForm('platform', 'tiktok')}
            >
              <Text style={styles.choiceText}>TikTok</Text>
            </Pressable>
            <Pressable
              style={[styles.choiceButton, form.platform === 'instagram' && styles.choiceButtonActive]}
              onPress={() => updateForm('platform', 'instagram')}
            >
              <Text style={styles.choiceText}>Instagram</Text>
            </Pressable>
          </View>

          {form.platform === 'instagram' ? (
            <View>
              <Text style={styles.sectionTitle}>Instagram Format</Text>
              <View style={styles.row}>
                <Pressable
                  style={[styles.choiceButton, form.instagramFormat === '4:5' && styles.choiceButtonActive]}
                  onPress={() => updateForm('instagramFormat', '4:5')}
                >
                  <Text style={styles.choiceText}>4:5 Portrait</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceButton, form.instagramFormat === '1:1' && styles.choiceButtonActive]}
                  onPress={() => updateForm('instagramFormat', '1:1')}
                >
                  <Text style={styles.choiceText}>1:1 Square</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Number of Slides</Text>
          <View style={styles.rowCenter}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => updateForm('slideCount', Math.max(3, form.slideCount - 1))}
            >
              <Text style={styles.stepperText}>-</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{form.slideCount}</Text>
            <Pressable
              style={styles.stepperButton}
              onPress={() => updateForm('slideCount', Math.min(15, form.slideCount + 1))}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Hook Mode</Text>
            <Switch
              value={form.hookMode}
              onValueChange={(value) => updateForm('hookMode', value)}
              thumbColor={form.hookMode ? '#F97316' : '#D1D5DB'}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Sublines</Text>
            <Switch
              value={form.showSubline}
              onValueChange={(value) => updateForm('showSubline', value)}
              thumbColor={form.showSubline ? '#F97316' : '#D1D5DB'}
            />
          </View>

          <Text style={styles.sectionTitle}>Text Density</Text>
          <View style={styles.row}>
            {(['ultra-short', 'standard', 'question-based'] as const).map((density) => (
              <Pressable
                key={density}
                style={[styles.choiceButton, form.textDensity === density && styles.choiceButtonActive]}
                onPress={() => updateForm('textDensity', density)}
              >
                <Text style={styles.choiceText}>{density.replace('-', ' ')}</Text>
              </Pressable>
            ))}
          </View>

          {form.showSubline ? (
            <View>
              <Text style={styles.sectionTitle}>Subline Style</Text>
              <View style={styles.row}>
                {(['explanatory', 'concise', 'action-oriented'] as const).map((style) => (
                  <Pressable
                    key={style}
                    style={[styles.choiceButton, form.sublineStyle === style && styles.choiceButtonActive]}
                    onPress={() => updateForm('sublineStyle', style)}
                  >
                    <Text style={styles.choiceText}>{style.replace('-', ' ')}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Subline Length</Text>
              <View style={styles.row}>
                {(['short', 'medium', 'long'] as const).map((length) => (
                  <Pressable
                    key={length}
                    style={[styles.choiceButton, form.sublineLength === length && styles.choiceButtonActive]}
                    onPress={() => updateForm('sublineLength', length)}
                  >
                    <Text style={styles.choiceText}>{length}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Relevant Backgrounds</Text>
            <Switch
              value={form.backgroundRelevance}
              onValueChange={(value) => updateForm('backgroundRelevance', value)}
              thumbColor={form.backgroundRelevance ? '#F97316' : '#D1D5DB'}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show Final CTA Slide</Text>
            <Switch
              value={form.showFinalSlide}
              onValueChange={(value) => updateForm('showFinalSlide', value)}
              thumbColor={form.showFinalSlide ? '#F97316' : '#D1D5DB'}
            />
          </View>

          {form.showFinalSlide ? (
            <View>
              <Text style={styles.sectionTitle}>CTA Headline</Text>
              <TextInput
                style={styles.input}
                placeholder="Link in bio"
                placeholderTextColor="#6B7280"
                value={form.ctaText}
                onChangeText={(value) => updateForm('ctaText', value)}
              />
              <Text style={styles.sectionTitle}>CTA Subtitle</Text>
              <TextInput
                style={styles.input}
                placeholder="Follow for more"
                placeholderTextColor="#6B7280"
                value={form.ctaSubtitle}
                onChangeText={(value) => updateForm('ctaSubtitle', value)}
              />
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Title Slide Text</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.choiceButton, form.titleTextSource === 'exact' && styles.choiceButtonActive]}
              onPress={() => updateForm('titleTextSource', 'exact')}
            >
              <Text style={styles.choiceText}>Exact Input</Text>
            </Pressable>
            <Pressable
              style={[styles.choiceButton, form.titleTextSource === 'optimized' && styles.choiceButtonActive]}
              onPress={() => updateForm('titleTextSource', 'optimized')}
            >
              <Text style={styles.choiceText}>Optimized Hook</Text>
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Title Slide Subtitle</Text>
            <Switch
              value={form.titleShowSubtitle}
              onValueChange={(value) => updateForm('titleShowSubtitle', value)}
              thumbColor={form.titleShowSubtitle ? '#F97316' : '#D1D5DB'}
            />
          </View>

          <Text style={styles.sectionTitle}>Style Preset</Text>
          <View style={styles.row}>
            {Object.keys(stylePresets).map((presetKey) => (
              <Pressable
                key={presetKey}
                style={[styles.choiceButton, form.stylePreset === presetKey && styles.choiceButtonActive]}
                onPress={() => updateForm('stylePreset', presetKey as keyof typeof stylePresets)}
              >
                <Text style={styles.choiceText}>{presetKey.replace('-', ' ')}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Accent Color</Text>
          <View style={styles.row}>
            {accentPresets.map((color) => (
              <Pressable
                key={color}
                style={[styles.colorSwatch, { backgroundColor: color }, form.accentColor === color && styles.colorSwatchActive]}
                onPress={() => updateForm('accentColor', color)}
              />
            ))}
          </View>

          <Pressable style={styles.primaryButton} onPress={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text style={styles.primaryText}>Generate Slides</Text>
            )}
          </Pressable>

          {generationStep ? <Text style={styles.statusText}>{generationStep}</Text> : null}

          {slides.length > 0 ? (
            <>
              <Pressable
                style={[styles.secondaryButton, isExporting && styles.secondaryButtonDisabled]}
                onPress={handleExportSlides}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color="#F97316" />
                ) : (
                  <Text style={styles.secondaryText}>Save Slides to Photos</Text>
                )}
              </Pressable>
              {exportStatus ? <Text style={styles.statusText}>{exportStatus}</Text> : null}
            </>
          ) : null}
        </View>

        {slides.length > 0 ? (
          <View style={styles.results}>
            {slides.map((slide, index) => (
              <ViewShot
                key={`${slide.index}-${slide.headline}`}
                ref={(ref) => {
                  captureRefs.current[index] = ref;
                }}
                options={{ format: 'png', quality: 1 }}
              >
                <SlideCard slide={slide} />
              </ViewShot>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#9CA3AF',
  },
  signOut: {
    color: '#F97316',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#1F1F1F',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: '#1F1F1F',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },
  choiceButtonActive: {
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  choiceText: {
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleLabel: {
    color: '#FFFFFF',
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  stepperValue: {
    color: '#FFFFFF',
    fontSize: 18,
    minWidth: 30,
    textAlign: 'center',
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryText: {
    color: '#0A0A0A',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryText: {
    color: '#F97316',
    fontWeight: '700',
  },
  statusText: {
    marginTop: 12,
    color: '#9CA3AF',
  },
  results: {
    marginTop: 24,
  },
});
