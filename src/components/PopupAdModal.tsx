import React from 'react';
import { Image, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    ad: any;
    imageUrl: string;
    onClose: () => void;
};

export function PopupAdModal({ ad, imageUrl, onClose }: Props) {
    const handlePress = () => {
        if (ad.link_url) {
            Linking.openURL(ad.link_url).catch(() => { });
            onClose();
        }
    };

    const imageElement = (
        <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
        />
    );

    return (
        <Modal transparent visible animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>

                    {ad.link_url ? (
                        <Pressable onPress={handlePress} style={styles.imageWrapper}>
                            {imageElement}
                        </Pressable>
                    ) : (
                        <View style={styles.imageWrapper}>
                            {imageElement}
                        </View>
                    )}

                    <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
                        <Text style={styles.closeBtnText}>ပိတ်မည် (Close)</Text>
                    </TouchableOpacity>

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
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.16)',
        shadowColor: '#040a1f',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.45,
        shadowRadius: 42,
        elevation: 24,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeBtn: {
        marginTop: 16,
        height: 44,
        width: '100%',
        backgroundColor: '#00e676',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: '#04141f',
        fontSize: 14,
        fontWeight: 'bold',
    },
});