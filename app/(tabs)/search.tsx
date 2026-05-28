import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { MOCK_CATEGORIES, MOCK_RESTAURANTS } from '@/constants/mockData';
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useDebounceValue } from '@/hooks/useDebounceValue';
import { Restaurant } from '@/types';

const CATEGORY_IMAGES: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=200&fit=crop',
  hamburger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop',
  japanese: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=200&fit=crop',
  brazilian: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=200&fit=crop',
  acai: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=200&fit=crop',
  arabic: 'https://images.unsplash.com/photo-1561043433-9265f73e685f?w=400&h=200&fit=crop',
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=200&fit=crop',
  'ice-cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=200&fit=crop',
  healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=200&fit=crop',
};

const HISTORY_KEY = '@ifood_search_history';
const MAX_HISTORY = 8;

const RATING_OPTIONS = [4.5, 4.0, 3.5];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedQuery = useDebounceValue(query, 350);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) setHistory(JSON.parse(raw));
    });
  }, []);

  const saveHistory = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
      setHistory(updated);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    },
    [history],
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const results: Restaurant[] = React.useMemo(() => {
    if (!debouncedQuery && !selectedCategory && !minRating) return [];

    let filtered = MOCK_RESTAURANTS;

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory) {
      // compara pelo nome da categoria (não pelo slug) para evitar problema de acentuação
      const catName = MOCK_CATEGORIES.find((c) => c.slug === selectedCategory)?.name ?? '';
      filtered = filtered.filter(
        (r) => r.category.toLowerCase() === catName.toLowerCase(),
      );
    }

    if (minRating) {
      filtered = filtered.filter((r) => r.rating >= minRating);
    }

    return filtered;
  }, [debouncedQuery, selectedCategory, minRating]);

  const isActive = debouncedQuery.length > 0 || !!selectedCategory || !!minRating;
  const showSearchBar = isFocused || isActive;

  const handleCategoryPress = (slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
    setQuery('');
    inputRef.current?.blur();
  };

  const handleHistoryPress = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setQuery('');
    setSelectedCategory(null);
    setMinRating(null);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleSubmit = () => {
    if (query.trim()) saveHistory(query);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const renderCategoryGrid = () => (
    <FlatList
      data={MOCK_CATEGORIES}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.categoryGrid}
      columnWrapperStyle={styles.categoryRow}
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>Explorar categorias</Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
          onPress={() => handleCategoryPress(item.slug)}
        >
          <Image
            source={{
              uri: CATEGORY_IMAGES[item.slug]
                ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop',
            }}
            style={styles.categoryCardImage}
            resizeMode="cover"
          />
          <View style={styles.categoryCardOverlay} />
          <View style={styles.categoryCardContent}>
            <Text style={styles.categoryCardIcon}>{item.icon}</Text>
            <Text style={styles.categoryCardName}>{item.name}</Text>
          </View>
        </Pressable>
      )}
    />
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Buscas recentes</Text>
        <Pressable onPress={clearHistory} hitSlop={8}>
          <Text style={styles.clearAllText}>Limpar tudo</Text>
        </Pressable>
      </View>
      {history.map((term, i) => (
        <Pressable
          key={term}
          style={[styles.historyRow, i < history.length - 1 && styles.historyRowBorder]}
          onPress={() => handleHistoryPress(term)}
        >
          <View style={styles.historyIconWrap}>
            <Text style={{ fontSize: 15 }}>🕐</Text>
          </View>
          <Text style={styles.historyText} numberOfLines={1}>{term}</Text>
          <Text style={styles.historyArrow}>↗</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderResults = () => (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      contentContainerStyle={styles.resultsList}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        results.length > 0 ? (
          <Text style={styles.resultsCount}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>Sem resultados</Text>
          <Text style={styles.emptySubtitle}>
            Nenhum restaurante encontrado{'\n'}para "
            {debouncedQuery || MOCK_CATEGORIES.find((c) => c.slug === selectedCategory)?.name}"
          </Text>
        </View>
      }
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <View style={styles.searchRow}>
          <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
            <Text style={styles.searchIconText}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Restaurantes, pratos, categorias..."
              placeholderTextColor={Colors.textLight}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>
          {showSearchBar && (
            <Pressable onPress={handleCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Filtros (visíveis quando há atividade) ────────────── */}
      {isActive && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {MOCK_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.slug && styles.chipActive]}
                onPress={() => handleCategoryPress(cat.slug)}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text style={[styles.chipText, selectedCategory === cat.slug && styles.chipTextActive]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {RATING_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, minRating === r && styles.chipActive]}
                onPress={() => setMinRating((prev) => (prev === r ? null : r))}
              >
                <Text style={[styles.chipText, minRating === r && styles.chipTextActive]}>
                  ⭐ {r}+
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Conteúdo principal ──────────────────────────────────── */}
      {isActive
        ? renderResults()
        : isFocused && history.length > 0
          ? renderHistory()
          : !isFocused
            ? renderCategoryGrid()
            : (
              <View style={styles.idleState}>
                <Text style={styles.idleEmoji}>🍔</Text>
                <Text style={styles.idleText}>
                  Busque por restaurantes,{'\n'}pratos ou categorias
                </Text>
              </View>
            )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.transparent,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  searchIconText: { fontSize: 16 },
  input: { flex: 1, height: 44, fontSize: FontSize.md, color: Colors.text },
  clearBtn: { fontSize: 14, color: Colors.textLight, padding: 4 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 2 },
  cancelText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },

  // Filtros
  filtersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  filtersScroll: { paddingHorizontal: Spacing.md, paddingVertical: 4, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 4,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },

  // Categoria grid
  categoryGrid: { padding: Spacing.md, paddingBottom: 100 },
  categoryRow: { gap: Spacing.sm, marginBottom: Spacing.sm },
  categoryCard: {
    flex: 1,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  categoryCardImage: { width: '100%', height: '100%' },
  categoryCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  categoryCardContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  categoryCardIcon: { fontSize: 26 },
  categoryCardName: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
  pressed: { opacity: 0.85 },

  // Histórico
  historyContainer: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  clearAllText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 10,
  },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  historyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  historyArrow: { fontSize: 16, color: Colors.textLight },

  // Resultados
  resultsList: { paddingHorizontal: Spacing.md, paddingBottom: 100, paddingTop: Spacing.sm },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Estados vazios
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  idleState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  idleEmoji: { fontSize: 56, marginBottom: 16 },
  idleText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
