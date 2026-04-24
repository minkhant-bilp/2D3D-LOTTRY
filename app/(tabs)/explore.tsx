import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: number, medium: number, tablet: number) => {
  if (isTablet) return tablet;
  if (isSmall) return small;
  return medium;
};

const THEME = {
  bg: '#050A1F',
  card: '#0B132B',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  muted: '#8A9BB3',
  neon: '#00E676',
  boxBg: 'rgba(255,255,255,0.03)',
};

interface ResultType {
  periodKey: 'morning' | 'afternoon' | 'evening';
  time: string;
  number: string;
}

interface HistoryItemType {
  id: string;
  date: string;
  results: ResultType[];
}

const HISTORY_DATA: HistoryItemType[] = [
  {
    id: '1',
    date: '5 March 2026',
    results: [
      { periodKey: 'morning', time: '12:01 PM', number: '45' },
      { periodKey: 'afternoon', time: '02:30 PM', number: '92' },
      { periodKey: 'evening', time: '04:30 PM', number: '18' },
    ],
  },
  {
    id: '2',
    date: '4 March 2026',
    results: [
      { periodKey: 'morning', time: '12:01 PM', number: '11' },
      { periodKey: 'afternoon', time: '02:30 PM', number: '34' },
      { periodKey: 'evening', time: '04:30 PM', number: '78' },
    ],
  },
  {
    id: '3',
    date: '3 March 2026',
    results: [
      { periodKey: 'morning', time: '12:01 PM', number: '05' },
      { periodKey: 'afternoon', time: '02:30 PM', number: '67' },
      { periodKey: 'evening', time: '04:30 PM', number: '99' },
    ],
  },
];

const DayCard = ({ item, getTranslatedPeriod }: { item: HistoryItemType, getTranslatedPeriod: (key: string) => string }) => {
  return (
    <View style={styles.card}>
      <View style={styles.dateHeader}>
        <Ionicons name="calendar-outline" size={s(14, 16, 20)} color={THEME.neon} style={styles.iconMarginRight} />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.resultsRow}>
        {item.results.map((res, index) => (
          <View key={index} style={styles.resultBox}>
            <Text style={styles.periodText}>{getTranslatedPeriod(res.periodKey)}</Text>
            <Text style={styles.timeText}>{res.time}</Text>
            <Text style={styles.numberText}>{res.number}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function LotteryHistory() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBackPress = () => {
    router.back();
  };

  const getTranslatedPeriod = (key: string) => {
    if (key === 'morning') return t.morning || 'Morning';
    if (key === 'afternoon') return t.afternoon || 'Afternoon';
    if (key === 'evening') return t.evening || 'Evening';
    return key;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItemType }) => (
    <DayCard item={item} getTranslatedPeriod={getTranslatedPeriod} />
  );

  const keyExtractor = (item: HistoryItemType) => item.id;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
        </Pressable>

        <Text style={styles.headerTitle}>{t.historyTitle || 'Lottery History'}</Text>

        <View style={styles.placeholderBtn} />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={HISTORY_DATA}
          renderItem={renderHistoryItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={4}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(15, 20, 30),
    paddingTop: s(40, 50, 70),
    paddingBottom: s(15, 20, 30),
    backgroundColor: THEME.bg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: {
    width: s(38, 44, 54),
    height: s(38, 44, 54),
    borderRadius: s(12, 14, 18),
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: THEME.text,
    fontSize: s(18, 20, 26),
    fontWeight: 'bold',
  },
  placeholderBtn: {
    width: s(38, 44, 54),
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: s(15, 20, 30),
    paddingBottom: s(30, 40, 60),
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: s(16, 20, 24),
    borderWidth: 1,
    borderColor: THEME.border,
    padding: s(14, 16, 24),
    marginBottom: s(14, 16, 24),
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: s(12, 16, 20),
  },
  iconMarginRight: {
    marginRight: s(6, 8, 12),
  },
  dateText: {
    color: THEME.text,
    fontSize: s(14, 15, 18),
    fontWeight: 'bold',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultBox: {
    flex: 1,
    backgroundColor: THEME.boxBg,
    borderRadius: s(12, 14, 18),
    paddingVertical: s(12, 14, 20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
    marginHorizontal: s(4, 5, 8),
  },
  periodText: {
    color: THEME.muted,
    fontSize: s(11, 12, 14),
    fontWeight: '600',
    marginBottom: s(2, 2, 4),
  },
  timeText: {
    color: THEME.muted,
    fontSize: s(9, 10, 12),
    marginBottom: s(8, 10, 14),
  },
  numberText: {
    color: THEME.neon,
    fontSize: s(26, 32, 42),
    fontWeight: '900',
  },
});