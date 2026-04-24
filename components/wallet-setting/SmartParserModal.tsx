import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { parsePastedBetsMobile } from '@/utils/SmartParser';
import useTranslation from '@/hooks/useTranslation';

const THEME = {
    bg: '#050A1F',
    card: '#19202d',
    inputBg: 'rgba(5, 10, 31, 0.68)',
    border: 'rgba(255, 255, 255, 0.12)',
    textWhite: '#FFFFFF',
    textMuted: '#8a9bb3',
    neonGreen: '#00e676',
    danger: '#ff9b93',
};

interface SmartParserModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (numbers: string[]) => void;
}

export default function SmartParserModal({ visible, onClose, onConfirm }: SmartParserModalProps) {
    const { t } = useTranslation();

    const [pasteText, setPasteText] = useState('');
    const [modalAmount, setModalAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleApply = () => {
        setError(null);
        const finalAmount = modalAmount.trim() === '' ? '100' : modalAmount.trim();

        if (!/^\d+$/.test(finalAmount) || Number(finalAmount) < 1) {
            setError(t.amountMinError || 'Amount ကို အနည်းဆုံး ၁ ကျပ် ထည့်ပါ။');
            return;
        }

        const parsedNumbers = parsePastedBetsMobile(pasteText);

        if (parsedNumbers.length === 0) {
            setError(t.noNumbersFoundError || 'မှန်ကန်သော ဂဏန်းများ ရှာမတွေ့ပါ။');
            return;
        }

        onConfirm(parsedNumbers);
        setPasteText('');
        setModalAmount('');
    };

    const handleClose = () => {
        setPasteText('');
        setError(null);
        onClose();
    };

    const parsedCount = parsePastedBetsMobile(pasteText).length;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalBox}>

                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="clipboard" size={24} color={THEME.neonGreen} />
                            <View style={styles.titleTextContainer}>
                                <Text style={styles.title}>{t.pasteTitle || 'Paste'}</Text>
                                <Text style={styles.subtitle}>{t.pasteDesc || 'Parse pasted bet text'}</Text>
                            </View>
                        </View>
                        <Pressable onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={THEME.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t.defaultAmount || 'Default Amount'}</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="number-pad"
                            value={modalAmount}
                            onChangeText={(t) => { setError(null); setModalAmount(t); }}
                            placeholder={t.defaultAmountPlaceholder || "100"}
                            placeholderTextColor={THEME.textMuted}
                        />
                        <Text style={styles.hintText}>{t.defaultAmountHint || 'စာသားထဲတွင် ငွေပမာဏမပါလျှင် ဤပမာဏကို အသုံးပြုမည်။'}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t.betText || 'Bet Text'}</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            textAlignVertical="top"
                            placeholder={t.betTextPlaceholder || "12.24.56 = 500\n1ပါ 500\nပါဝါ 1000"}
                            placeholderTextColor={THEME.textMuted}
                            value={pasteText}
                            onChangeText={(text) => { setError(null); setPasteText(text); }}
                        />
                        {pasteText.trim().length > 0 && parsedCount > 0 && (
                            <Text style={styles.readyText}>{parsedCount} {t.betRowsReady || 'bet rows ready'}</Text>
                        )}
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <View style={styles.actionRow}>
                        <Pressable style={styles.btnCancel} onPress={handleClose}>
                            <Text style={styles.btnCancelText}>{t.cancel || 'Cancel'}</Text>
                        </Pressable>
                        <Pressable style={styles.btnApply} onPress={handleApply}>
                            <Text style={styles.btnApplyText}>{t.apply || 'Apply'}</Text>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },

    modalBox: { width: '100%', maxWidth: 360, backgroundColor: THEME.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: THEME.border },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },

    titleRow: { flexDirection: 'row', alignItems: 'center' },

    titleTextContainer: { marginLeft: 10 },

    title: { color: THEME.textWhite, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },

    subtitle: { color: THEME.textMuted, fontSize: 10, marginTop: 2 },

    closeBtn: { padding: 4 },

    fieldContainer: { marginBottom: 16 },

    label: { color: THEME.textMuted, fontSize: 12, marginBottom: 6 },

    amountInput: { height: 44, backgroundColor: THEME.inputBg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, color: THEME.textWhite, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },

    hintText: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 4 },

    textArea: { height: 120, backgroundColor: THEME.inputBg, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, color: THEME.textWhite, fontSize: 14, padding: 12 },

    readyText: { color: THEME.neonGreen, fontSize: 12, marginTop: 6 },

    errorText: { color: THEME.danger, fontSize: 12, marginBottom: 12 },

    actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },

    btnCancel: { flex: 1, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },

    btnCancelText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 14 },

    btnApply: { flex: 1, height: 48, borderRadius: 12, backgroundColor: THEME.neonGreen, justifyContent: 'center', alignItems: 'center' },

    btnApplyText: { color: '#003824', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
});