import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { isSoldOut, type UnavailableNumber } from '../../utils/unavailableNumbers';

type Props = {
    numbers: UnavailableNumber[];
    currency: string;
};

/** Break and limit-reached numbers from a rejected bet, grouped by reason. */
export function UnavailableNumbersList({ numbers, currency }: Props) {
    const { t } = useTranslation();

    const closed = numbers.filter((entry) => entry.reason === 'closed');
    const limited = numbers.filter((entry) => entry.reason === 'limit_reached');

    return (
        <View style={styles.root}>
            {closed.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: '#F87171' }]}>
                        {t('bet_unavailable.closed', 'Break (closed)') as string}
                    </Text>
                    <View style={styles.chips}>
                        {closed.map((entry) => (
                            <View key={entry.number} style={[styles.chip, styles.closedChip]}>
                                <Text style={[styles.chipNumber, { color: '#FECACA' }]}>{entry.number}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {limited.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: '#FBBF24' }]}>
                        {t('bet_unavailable.limit', 'Sales limit reached') as string}
                    </Text>
                    <View style={styles.chips}>
                        {limited.map((entry) => (
                            <View key={entry.number} style={[styles.chip, styles.limitChip]}>
                                <Text style={[styles.chipNumber, { color: '#FDE68A' }]}>{entry.number}</Text>
                                <Text style={styles.chipDetail}>
                                    {' · '}
                                    {isSoldOut(entry)
                                        ? (t('bet_unavailable.sold_out', 'sold out') as string)
                                        : (t('bet_unavailable.remaining', '{{amount}} left', {
                                              amount: `${Number(entry.remaining).toLocaleString()} ${currency}`,
                                          }) as string)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { width: '100%', marginBottom: 20, gap: 14 },
    section: { width: '100%' },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    closedChip: { borderColor: 'rgba(248, 113, 113, 0.4)', backgroundColor: 'rgba(248, 113, 113, 0.12)' },
    limitChip: { borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.12)' },
    chipNumber: { fontSize: 15, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    chipDetail: { color: '#FBBF24', fontSize: 12, fontWeight: '500' },
});
