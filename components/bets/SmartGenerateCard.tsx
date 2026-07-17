import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BetNumberRow, useBetStore } from '../../store/useBetStore';
import { BROTHER_PAIRS, createEmptyRow, getPermutations3D, NAKKHAT_PAIRS, parsePastedBets, parsePastedBets3D, POWER_PAIRS } from '../../utils/betLogic';

type GeneratorKey = 'reverse' | 'double' | 'nakkhat' | 'power' | 'brother' | 'khway' | 'a-par' | 'paste' | 'tut';

export default function SmartGenerateCard() {
    const { isTwoDType, setBetRowsBulk, betRows } = useBetStore();
    const [open, setOpen] = useState(false);
    const [activeGen, setActiveGen] = useState<GeneratorKey | null>(null);

    const [modalNumber, setModalNumber] = useState('');
    const [modalAmount, setModalAmount] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalDigits, setModalDigits] = useState<Set<string>>(new Set());
    const [modalIncludeDoubles, setModalIncludeDoubles] = useState(false);
    const [modalDirectAmount, setModalDirectAmount] = useState('');
    const [pasteText, setPasteText] = useState('');

    const maxDigits = isTwoDType ? 2 : 3;

    const commonGenerators = [
        { key: 'reverse', icon: 'sync-alt', label: 'REVERSE', desc: 'Add a number + its mirror' },
        { key: 'double', icon: 'filter-2', label: 'DOUBLE', desc: isTwoDType ? 'All doubles 00–99' : 'All doubles 000–999' },
    ];

    const generators = isTwoDType ? [
        ...commonGenerators,
        { key: 'nakkhat', icon: 'stars', label: 'NAKKHAT', desc: '10 lucky pairs' },
        { key: 'power', icon: 'bolt', label: 'POWER', desc: '10 pairs diff. of 5' },
        { key: 'brother', icon: 'group', label: 'BROTHER', desc: '20 consecutive pairs' },
        { key: 'khway', icon: 'casino', label: 'KHWAY', desc: 'Permutation wheel' },
        { key: 'a-par', icon: 'tag', label: 'A-PAR', desc: 'All 19 pairs with digit' },
        { key: 'paste', icon: 'content-paste', label: 'PASTE', desc: 'Parse pasted bet text' },
    ] : [
        ...commonGenerators,
        { key: 'tut', icon: 'all-inclusive', label: 'TUT', desc: 'Direct + Box permutations' },
        { key: 'paste', icon: 'content-paste', label: 'PASTE', desc: 'Parse pasted 3D bets' },
    ];

    const openModal = (key: GeneratorKey) => {
        setActiveGen(key);
        setModalNumber('');
        setModalAmount('');
        setModalError(null);
        setModalDigits(new Set());
        setModalIncludeDoubles(false);
        setModalDirectAmount('');
        setPasteText('');
        if (key === 'paste') setModalAmount('100');
    };

    const closeModal = () => {
        setActiveGen(null);
        setModalError(null);
    };

    const confirmGenerate = () => {
        setModalError(null);
        const existing = new Set(betRows.map(r => r.number));
        let newRows: BetNumberRow[] = [];

        if (activeGen === 'tut') {
            const num = modalNumber.trim();
            if (!/^\d{3}$/.test(num)) {
                setModalError('Enter exactly 3 digits.');
                return;
            }
            const boxAmt = modalAmount.trim();
            if (!/^\d+$/.test(boxAmt) || Number(boxAmt) < 1) {
                setModalError('Box amount must be an integer ≥ 1.');
                return;
            }
            const directAmt = modalDirectAmount.trim();
            const hasDirectBet = /^\d+$/.test(directAmt) && Number(directAmt) >= 1;

            if (hasDirectBet && !existing.has(num)) {
                newRows.push({ ...createEmptyRow(), number: num, amount: directAmt });
            }
            const perms = getPermutations3D(num);
            for (const perm of perms) {
                const alreadyInNew = newRows.some(r => r.number === perm && r.amount === boxAmt);
                if (!existing.has(perm) && !alreadyInNew) {
                    newRows.push({ ...createEmptyRow(), number: perm, amount: boxAmt });
                }
            }
            if (newRows.length > 0) setBetRowsBulk(newRows);
            closeModal();
            return;
        }

        if (activeGen === 'paste') {
            const amt = modalAmount.trim();
            if (!/^\d+$/.test(amt) || Number(amt) < 1) {
                setModalError('Enter a valid default amount (integer ≥ 1).');
                return;
            }
            const rows = isTwoDType ? parsePastedBets(pasteText, amt) : parsePastedBets3D(pasteText, amt);
            if (rows.length === 0) {
                setModalError(isTwoDType ? 'No valid 2-digit numbers found.' : 'No valid 3-digit numbers found.');
                return;
            }
            setBetRowsBulk(rows);
            closeModal();
            return;
        }

        const amount = modalAmount.trim();
        if (!/^\d+$/.test(amount) || Number(amount) < 1) {
            setModalError('Amount must be an integer ≥ 1.');
            return;
        }

        if (activeGen === 'reverse') {
            const num = modalNumber.trim();
            if (num.length < 2 || num.length > maxDigits) {
                setModalError(isTwoDType ? 'Enter exactly 2 digits.' : 'Enter 2 or 3 digits.');
                return;
            }
            const rev = num.split('').reverse().join('');
            if (!existing.has(num)) newRows.push({ ...createEmptyRow(), number: num, amount });
            if (rev !== num && !existing.has(rev) && !newRows.some(r => r.number === rev)) {
                newRows.push({ ...createEmptyRow(), number: rev, amount });
            }
        }
        else if (activeGen === 'a-par') {
            const digit = modalNumber.trim();
            if (!/^\d$/.test(digit)) {
                setModalError('Enter exactly 1 digit (0–9).');
                return;
            }
            const candidates = new Set<string>();
            for (let i = 0; i <= 9; i++) {
                candidates.add(`${digit}${i}`);
                candidates.add(`${i}${digit}`);
            }
            newRows = [...candidates].filter(n => !existing.has(n)).map(n => ({ ...createEmptyRow(), number: n, amount }));
        }
        else if (activeGen === 'khway') {
            if (modalDigits.size < 2) {
                setModalError('Select at least 2 digits.');
                return;
            }
            for (const a of Array.from(modalDigits)) {
                for (const b of Array.from(modalDigits)) {
                    if (a === b && !modalIncludeDoubles) continue;
                    const num = `${a}${b}`;
                    if (!existing.has(num)) newRows.push({ ...createEmptyRow(), number: num, amount });
                }
            }
        }
        else if (activeGen === 'double') {
            const doubles = Array.from({ length: 10 }, (_, i) => String(i).repeat(maxDigits));
            newRows = doubles.filter(n => !existing.has(n)).map(n => ({ ...createEmptyRow(), number: n, amount }));
        }
        else {
            let pairSet: [string, string][] = [];
            if (activeGen === 'nakkhat') pairSet = NAKKHAT_PAIRS;
            if (activeGen === 'power') pairSet = POWER_PAIRS;
            if (activeGen === 'brother') pairSet = BROTHER_PAIRS;

            newRows = pairSet.flatMap(([a, b]) => [a, b])
                .filter(n => !existing.has(n))
                .map(n => ({ ...createEmptyRow(), number: n, amount }));
        }

        if (newRows.length > 0) setBetRowsBulk(newRows);
        closeModal();
    };

    const activeDef = generators.find(g => g.key === activeGen);

    return (
        <View style={styles.container}>
            <Pressable style={styles.header} onPress={() => setOpen(!open)}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="auto-awesome" size={20} color="#51e1a5" />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.title}>SMART GENERATE</Text>
                        <Text style={styles.subtitle}>Auto-fill number patterns</Text>
                    </View>
                </View>
                <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={24} color="rgba(255,255,255,0.3)" />
            </Pressable>

            {open && (
                <View style={styles.grid}>
                    {generators.map((gen) => (
                        <Pressable key={gen.key} style={styles.genBtn} onPress={() => openModal(gen.key as GeneratorKey)}>
                            <MaterialIcons name={gen.icon as any} size={26} color="#51e1a5" />
                            <Text style={styles.genLabel}>{gen.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}

            <Modal visible={activeGen !== null} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {activeDef && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialIcons name={activeDef.icon as any} size={20} color="#51e1a5" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.modalTitle}>{activeDef.label}</Text>
                                            <Text style={styles.modalSub}>{activeDef.desc}</Text>
                                        </View>
                                    </View>
                                    <Pressable onPress={closeModal}>
                                        <MaterialIcons name="close" size={24} color="#8a9bb3" />
                                    </Pressable>
                                </View>

                                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                                    {activeGen === 'tut' && (
                                        <>
                                            <Text style={styles.inputLabel}>Number (000-999)</Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" maxLength={3} value={modalNumber} onChangeText={setModalNumber} />
                                            <Text style={styles.inputLabel}>Direct Amount (0 = skip)</Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" value={modalDirectAmount} onChangeText={setModalDirectAmount} />
                                            <Text style={styles.inputLabel}>Box Amount</Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" value={modalAmount} onChangeText={setModalAmount} />
                                        </>
                                    )}

                                    {activeGen === 'paste' && (
                                        <>
                                            <Text style={styles.inputLabel}>Default Amount</Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" value={modalAmount} onChangeText={setModalAmount} />
                                            <Text style={styles.inputLabel}>Bet Text</Text>
                                            <TextInput style={[styles.input, { height: 120, textAlign: 'left', textAlignVertical: 'top' }]} multiline value={pasteText} onChangeText={setPasteText} />
                                        </>
                                    )}

                                    {(activeGen === 'reverse' || activeGen === 'a-par') && (
                                        <>
                                            <Text style={styles.inputLabel}>
                                                {activeGen === 'a-par' ? 'Digit (0-9)' : (isTwoDType ? 'Number (00-99)' : 'Number (00-999)')}
                                            </Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" maxLength={activeGen === 'a-par' ? 1 : maxDigits} value={modalNumber} onChangeText={setModalNumber} />
                                        </>
                                    )}

                                    {activeGen === 'khway' && (
                                        <>
                                            <Text style={styles.inputLabel}>Select digits</Text>
                                            <View style={styles.digitsGrid}>
                                                {Array.from({ length: 10 }, (_, i) => String(i)).map(d => (
                                                    <Pressable
                                                        key={d}
                                                        style={[styles.digitBtn, modalDigits.has(d) && styles.digitBtnActive]}
                                                        onPress={() => {
                                                            setModalDigits(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(d)) {
                                                                    next.delete(d);
                                                                } else {
                                                                    next.add(d);
                                                                }
                                                                return next;
                                                            });
                                                        }}
                                                    >
                                                        <Text style={[styles.digitText, modalDigits.has(d) && styles.digitTextActive]}>{d}</Text>
                                                    </Pressable>
                                                ))}
                                            </View>
                                            <Pressable style={styles.checkboxRow} onPress={() => setModalIncludeDoubles(!modalIncludeDoubles)}>
                                                <MaterialIcons name={modalIncludeDoubles ? 'check-box' : 'check-box-outline-blank'} size={20} color="#51e1a5" />
                                                <Text style={styles.checkboxLabel}>Include doubles (11, 22...)</Text>
                                            </Pressable>
                                        </>
                                    )}

                                    {activeGen !== 'paste' && activeGen !== 'tut' && (
                                        <>
                                            <Text style={styles.inputLabel}>Amount per number</Text>
                                            <TextInput style={styles.input} keyboardType="number-pad" value={modalAmount} onChangeText={setModalAmount} />
                                        </>
                                    )}

                                    {modalError !== null && <Text style={styles.errorText}>{modalError}</Text>}
                                </ScrollView>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.confirmBtn} onPress={confirmGenerate}>
                                        <Text style={styles.confirmBtnText}>Generate</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(35, 41, 60, 0.4)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        marginBottom: 12
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        color: '#51e1a5',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        marginTop: 2
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)'
    },
    genBtn: {
        width: '31%',
        aspectRatio: 1.1,
        backgroundColor: '#19202D',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(81, 225, 165, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '1%',
        marginBottom: 8,
    },
    genLabel: {
        color: '#51e1a5',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 8,
        letterSpacing: 0.5
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#19202d', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    modalTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
    modalSub: { color: '#8a9bb3', fontSize: 11, marginTop: 2 },
    inputLabel: { color: '#8a9bb3', fontSize: 12, marginBottom: 6, marginTop: 10 },
    input: { backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, color: '#f7f9ff', fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
    digitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    digitBtn: { width: '18%', height: 40, backgroundColor: '#19202d', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    digitBtnActive: { backgroundColor: 'rgba(81, 225, 165, 0.15)', borderColor: 'rgba(81, 225, 165, 0.4)' },
    digitText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 'bold' },
    digitTextActive: { color: '#51e1a5' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 4 },
    checkboxLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 8 },
    errorText: { color: '#ff9b93', fontSize: 12, marginTop: 10 },

    modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
    cancelBtnText: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' },
    confirmBtn: { flex: 1, padding: 14, backgroundColor: '#00e676', borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { color: '#003824', fontWeight: 'bold', textTransform: 'uppercase' }
});