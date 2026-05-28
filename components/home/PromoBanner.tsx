import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string;
}

const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Frete Grátis',
    subtitle: 'Em todos os pedidos acima de R$ 30',
    image: 'https://picsum.photos/seed/banner1/400/180',
    backgroundColor: Colors.primary,
  },
  {
    id: '2',
    title: '30% OFF',
    subtitle: 'Hambúrgueres selecionados',
    image: 'https://picsum.photos/seed/banner2/400/180',
    backgroundColor: '#FF8C00',
  },
  {
    id: '3',
    title: 'Novidade!',
    subtitle: 'Restaurantes japoneses agora disponíveis',
    image: 'https://picsum.photos/seed/banner3/400/180',
    backgroundColor: '#1976D2',
  },
];

interface Props {
  scrollX: React.MutableRefObject<number>;
}

export function PromoBanner() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View>
      <View style={styles.container}>
        {BANNERS.map((banner, index) => (
          <Pressable
            key={banner.id}
            style={[
              styles.banner,
              { backgroundColor: banner.backgroundColor },
              index !== activeIndex && styles.hidden,
            ]}
          >
            <View style={styles.textBlock}>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
            </View>
            <Image source={{ uri: banner.image }} style={styles.image} />
          </Pressable>
        ))}
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <Pressable key={i} onPress={() => setActiveIndex(i)}>
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: Spacing.md, marginVertical: Spacing.sm },
  banner: {
    borderRadius: BorderRadius.md,
    height: 140,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: Spacing.md,
  },
  hidden: { display: 'none' },
  textBlock: { flex: 1, paddingRight: Spacing.sm },
  title: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.88)', fontSize: FontSize.sm },
  image: { width: 110, height: 110, borderRadius: BorderRadius.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm, gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.primary, width: 20 },
});
