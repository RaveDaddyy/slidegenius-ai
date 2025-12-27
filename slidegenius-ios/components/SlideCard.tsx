import { View, Text, StyleSheet, ImageBackground } from 'react-native';

export type Slide = {
  index: number;
  headline: string;
  highlightWord: string;
  subline: string;
  backgroundUrl?: string;
  accentColor?: string;
  textColor?: string;
  isFinalSlide?: boolean;
  showSubline?: boolean;
  titleShowSubtitle?: boolean;
  platform?: string;
};

function renderHeadline(headline: string, highlightWord: string, textColor: string, accentColor: string) {
  const words = headline.split(' ');
  let highlightUsed = false;

  return (
    <Text style={[styles.headline, { color: textColor }]}> 
      {words.map((word, idx) => {
        const isHighlight = !highlightUsed && word.toLowerCase() === highlightWord.toLowerCase();
        if (isHighlight) highlightUsed = true;
        return (
          <Text key={`${word}-${idx}`} style={isHighlight ? { color: accentColor } : undefined}>
            {word}{idx < words.length - 1 ? ' ' : ''}
          </Text>
        );
      })}
    </Text>
  );
}

export default function SlideCard({ slide }: { slide: Slide }) {
  const textColor = slide.textColor ?? '#FFFFFF';
  const accentColor = slide.accentColor ?? '#F97316';
  const isTitleSlide = slide.index === 1;
  const isFinalSlide = slide.isFinalSlide === true;
  const showSubline = isFinalSlide
    ? Boolean(slide.subline)
    : isTitleSlide
      ? Boolean(slide.titleShowSubtitle && slide.subline)
      : slide.showSubline !== false && Boolean(slide.subline);

  return (
    <View style={styles.card}>
      <ImageBackground
        source={slide.backgroundUrl ? { uri: slide.backgroundUrl } : undefined}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          {renderHeadline(slide.headline, slide.highlightWord, textColor, accentColor)}
          {showSubline ? <Text style={[styles.subline, { color: textColor }]}>{slide.subline}</Text> : null}
        </View>
      </ImageBackground>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Slide {slide.index}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  image: {
    height: 420,
    justifyContent: 'center',
  },
  imageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  overlay: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    height: '100%',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  metaRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0B0B0B',
  },
  metaText: {
    color: '#6B7280',
    fontSize: 12,
  },
});
