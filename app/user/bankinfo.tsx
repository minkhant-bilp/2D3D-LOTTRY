import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BANKS = [
  { code: 'KBZ', label: 'Kanbawza Bank', currency: 'MMK' },
  { code: 'KBZPay', label: 'KBZ Pay', currency: 'MMK' },
  { code: 'AYA', label: 'AYA Bank', currency: 'MMK' },
  { code: 'KBank', label: 'Kasikornbank', currency: 'THB' },
  { code: 'BBL', label: 'Bangkok Bank', currency: 'THB' },
];

export default function BankInfoPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bankName, setBankName] = useState('KBZ');
  const [accountName, setAccountName] = useState('Min Khant');
  const [accountNumber, setAccountNumber] = useState('09425965658');

  const [showBankList, setShowBankList] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedBank = BANKS.find(b => b.code === bankName);

  const handleSave = () => {
    setShowConfirm(false);
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.eyebrow}>ပိုက်ဆံအိတ်</Text>
          <Text style={styles.title}>ဘဏ်အချက်အလက်</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialIcons name="account-balance" size={20} color="#9CA3AF" />
              <Text style={styles.cardTitle}>ဘဏ်အကောင့်</Text>
            </View>
            <View style={styles.savedBadge}>
              <MaterialIcons name="check-circle-outline" size={14} color="#10B981" />
              <Text style={styles.savedBadgeText}>SAVED</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ဘဏ်</Text>
            <Pressable
              style={styles.selectBox}
              onPress={() => setShowBankList(true)}
            >
              <Text style={styles.selectBoxText}>
                {selectedBank ? `${selectedBank.code} — ${selectedBank.label}` : 'ဘဏ်ရွေးချယ်ပါ'}
              </Text>
              <MaterialIcons name="expand-more" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>အကောင့်နာမည်</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="ဥပမာ - Aung Ko Ko"
              placeholderTextColor="#4B5563"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>အကောင့်နံပါတ်</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="ဥပမာ - 09123456789"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowConfirm(true)}
            style={styles.btnWrapper}
          >
            <LinearGradient
              colors={['#4F8CFF', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text style={styles.submitBtnText}>ဘဏ်အချက်အလက် မွမ်းမံမည်</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showBankList} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>ဘဏ်ရွေးချယ်ပါ</Text>
              <Pressable onPress={() => setShowBankList(false)}>
                <MaterialIcons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>
            <ScrollView>
              {BANKS.map((bank) => (
                <Pressable
                  key={bank.code}
                  style={[styles.bankOption, bankName === bank.code && styles.bankOptionActive]}
                  onPress={() => { setBankName(bank.code); setShowBankList(false); }}
                >
                  <Text style={[styles.bankCode, bankName === bank.code && { color: '#93c5fd' }]}>{bank.code}</Text>
                  <Text style={styles.bankLabel}>{bank.label}</Text>
                  {bankName === bank.code && <MaterialIcons name="check" size={20} color="#93c5fd" style={{ marginLeft: 'auto' }} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="warning" size={24} color="#f59e0b" />
              <Text style={styles.confirmTitle}>အတည်ပြုပါ</Text>
            </View>
            <Text style={styles.confirmDesc}>သင်၏ ဘဏ်အကောင့်အချက်အလက်များကို သိမ်းဆည်းမှာ သေချာပါသလား?</Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>သိမ်းမည်</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelBtnText}>မလုပ်ပါ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060B19'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#060B19',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60
  },
  card: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1221',
    padding: 20
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#060B19',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F3F4F6',
    fontSize: 15
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#060B19',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  selectBoxText: {
    color: '#F3F4F6',
    fontSize: 15
  },
  btnWrapper: {
    marginTop: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#0B1221', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%', borderWidth: 1, borderColor: '#1F2937' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { color: '#F3F4F6', fontSize: 18, fontWeight: 'bold' },
  bankOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  bankOptionActive: { backgroundColor: 'rgba(59,130,246,0.1)' },
  bankCode: { color: '#F3F4F6', fontSize: 15, fontWeight: 'bold', width: 80, marginLeft: 12 },
  bankLabel: { color: '#9CA3AF', fontSize: 14 },

  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmModal: { width: '100%', backgroundColor: '#0B1221', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1F2937' },
  confirmHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  confirmTitle: { color: '#F3F4F6', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  confirmDesc: { color: '#9CA3AF', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  confirmActions: { flexDirection: 'column', gap: 12 },
  actionBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { backgroundColor: '#3B82F6' },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1F2937' },
  cancelBtnText: { color: '#9CA3AF', fontSize: 15, fontWeight: 'bold' },
});