import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

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
  period: string;
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
      { period: 'မနက်', time: '12:01 PM', number: '45' },
      { period: 'နေ့လည်', time: '02:30 PM', number: '92' },
      { period: 'ညနေ', time: '04:30 PM', number: '18' },
    ],
  },
  {
    id: '2',
    date: '4 March 2026',
    results: [
      { period: 'မနက်', time: '12:01 PM', number: '11' },
      { period: 'နေ့လည်', time: '02:30 PM', number: '34' },
      { period: 'ညနေ', time: '04:30 PM', number: '78' },
    ],
  },
  {
    id: '3',
    date: '3 March 2026',
    results: [
      { period: 'မနက်', time: '12:01 PM', number: '05' },
      { period: 'နေ့လည်', time: '02:30 PM', number: '67' },
      { period: 'ညနေ', time: '04:30 PM', number: '99' },
    ],
  },
];

const DayCard = ({ item }: { item: HistoryItemType }) => {
  return (
    <View style={styles.card}>
      <View style={styles.dateHeader}>
        <Ionicons name="calendar-outline" size={16} color={THEME.neon} />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.resultsRow}>
        {item.results.map((res, index) => (
          <View key={index} style={styles.resultBox}>
            <Text style={styles.periodText}>{res.period}</Text>
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

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={THEME.text} />
        </Pressable>

        <Text style={styles.headerTitle}>ထွက်ဂဏန်းမှတ်တမ်း</Text>

        <View style={styles.placeholderBtn} />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={HISTORY_DATA}
          renderItem={({ item }) => <DayCard item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: THEME.bg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderBtn: {
    width: 44,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  resultBox: {
    flex: 1,
    backgroundColor: THEME.boxBg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  periodText: {
    color: THEME.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeText: {
    color: THEME.muted,
    fontSize: 10,
    marginBottom: 10,
  },
  numberText: {
    color: THEME.neon,
    fontSize: 32,
    fontWeight: '900',
  },
});