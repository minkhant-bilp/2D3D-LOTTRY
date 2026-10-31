import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PromptProps = {
    visible: boolean;
    onRestart: () => void;
    onLater: () => void;
};

/** Offered for a normal OTA update once it has downloaded. "Later" defers it to the next cold start. */
export function OtaUpdateModal({ visible, onRestart, onLater }: PromptProps) {
    const { t } = useTranslation();

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onLater}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{t('ota.title')}</Text>
                    <Text style={styles.desc}>{t('ota.desc')}</Text>

                    <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={onRestart}>
                        <Text style={styles.primaryBtnText}>{t('ota.restart_btn')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={onLater}>
                        <Text style={styles.secondaryBtnText}>{t('ota.later_btn')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/** Covers the app while a critical update reloads it. Not dismissable on purpose. */
export function ForcedUpdateOverlay({ visible }: { visible: boolean }) {
    const { t } = useTranslation();

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => { }}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <ActivityIndicator size="large" color="#00e676" />
                    <Text style={[styles.desc, styles.forcingText]}>{t('ota.forcing')}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(4, 10, 31, 0.56)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#0f1d38',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.16)',
        shadowColor: '#040a1f',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.45,
        shadowRadius: 42,
        elevation: 24,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    desc: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 14,
        lineHeight: 22,
    },
    forcingText: {
        marginTop: 16,
        textAlign: 'center',
    },
    primaryBtn: {
        marginTop: 20,
        height: 44,
        width: '100%',
        backgroundColor: '#00e676',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#04141f',
        fontSize: 14,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        marginTop: 8,
        height: 44,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    },
});
