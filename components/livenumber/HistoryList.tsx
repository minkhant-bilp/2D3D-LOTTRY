import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, View, TextInput, Pressable, KeyboardAvoidingView, Image, Modal, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore, ChatMessage } from '@/store/useChatStore';

const THEME = {
    bg: '#050A1F',
    cardBg: '#0B132B',
    chatBubble: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    adminRed: '#FF3B30',
    borderNormal: 'rgba(255, 255, 255, 0.1)',
};

export default function LiveChatSection() {
    const insets = useSafeAreaInsets();

    const chats = useChatStore((state) => state.chats);
    const addMessage = useChatStore((state) => state.addMessage);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            userName: 'Me (Min Khant)',
            avatar: 'https://i.pravatar.cc/150?u=me',
            message: inputText.trim(),
            role: 'user'
        };

        addMessage(newMessage);

        setInputText('');
        setIsTyping(false);
        Keyboard.dismiss();

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    };

    const renderChatItem = ({ item }: { item: ChatMessage }) => {
        const nameColor = item.role === 'admin' ? THEME.adminRed : (item.role === 'vip' ? THEME.gold : THEME.textMuted);

        return (
            <View style={styles.chatRow}>
                <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
                <View style={styles.chatBubble}>
                    <View style={styles.nameContainer}>
                        <Text style={[styles.chatName, { color: nameColor }]}>{item.userName}</Text>
                        {item.role === 'admin' ? (
                            <View style={styles.iconWrapper}>
                                <MaterialCommunityIcons name="shield-check" size={14} color={THEME.adminRed} />
                            </View>
                        ) : null}
                        {item.role === 'vip' ? (
                            <View style={styles.iconWrapper}>
                                <MaterialCommunityIcons name="star-circle" size={14} color={THEME.gold} />
                            </View>
                        ) : null}
                    </View>
                    <Text style={styles.chatMessage}>{item.message}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.chatContainer}>

            <View style={styles.headerRow}>
                <View style={styles.liveIndicator} />
                <Text style={styles.sectionTitle}>Live Chat</Text>

                <Pressable
                    style={({ pressed }) => [styles.iconBtn, pressed ? { transform: [{ scale: 0.9 }] } : null]}
                    onPress={() => setIsTyping(true)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color={THEME.neonGreen} />
                </Pressable>

                <View style={styles.spacer} />

                <View style={styles.viewersBadge}>
                    <Ionicons name="eye" size={14} color={THEME.textMuted} />
                    <View style={styles.iconWrapper}>
                        <Text style={styles.viewersCount}>1.2K</Text>
                    </View>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={renderChatItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <Modal visible={isTyping} transparent animationType="fade" onRequestClose={() => setIsTyping(false)}>
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => { setIsTyping(false); Keyboard.dismiss(); }} />

                    <View style={[
                        styles.inputWrapper,
                        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 15) }
                    ]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Comment ရေးရန်..."
                            placeholderTextColor={THEME.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            autoFocus={true}
                            multiline={false}
                        />
                        <Pressable
                            style={[styles.sendButton, inputText.trim() === '' ? { backgroundColor: THEME.borderNormal } : null]}
                            onPress={handleSend}
                            disabled={inputText.trim() === ''}
                        >
                            <Ionicons name="send" size={18} color={inputText.trim() === '' ? THEME.textMuted : THEME.bg} style={styles.sendIconFix} />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    chatContainer: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal
    },
    liveIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.adminRed,
        marginRight: 8
    },
    sectionTitle: {
        color: THEME.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 15
    },
    iconBtn: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    spacer: {
        flex: 1
    },
    viewersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    viewersCount: {
        color: THEME.textMuted,
        fontSize: 12,
        fontWeight: 'bold'
    },
    flatListContent: {
        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 120
    },
    chatRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'flex-start'
    },
    chatAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        backgroundColor: THEME.cardBg
    },
    chatBubble: {
        flex: 1,
        backgroundColor: THEME.chatBubble,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderTopLeftRadius: 4
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    chatName: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    iconWrapper: {
        marginLeft: 4
    },
    chatMessage: {
        color: THEME.textWhite,
        fontSize: 14,
        lineHeight: 22
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: THEME.cardBg,
        borderTopWidth: 1,
        borderTopColor: THEME.borderNormal
    },
    textInput: {
        flex: 1,
        height: 46,
        backgroundColor: THEME.bg,
        borderRadius: 23,
        paddingHorizontal: 18,
        color: THEME.textWhite,
        fontSize: 15,
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: THEME.neonGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12
    },
    sendIconFix: {
        marginLeft: 2
    }
});