import { axiosClient } from './axiosClient';


export const getMe = () => axiosClient.get('/me');

export const getMyWallet = () => axiosClient.get('/me/wallet');

export const getNotificationStats = () => axiosClient.get('/notifications/stats');

export const getTwoDLive = () => axiosClient.get('/two-d-results/live');

export const listTwoDResultsLastFiveDays = () => axiosClient.get('/two-d-results/last-5-days');

export const listTwoDSideNumbersLastFiveDays = () => axiosClient.get('/two-d-side-numbers/last-5-days');


export const listBankSettingsAPI = () => 
    axiosClient.get('/bank-settings').then(res => res.data);

export const createDepositAPI = (formData: FormData) => 
    axiosClient.post('/deposits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);

export const listWithdrawalsAPI = (params: { page: number; page_size: number }) => 
    axiosClient.get('/withdrawals', { params }).then(res => res.data);

export const getMyBankInfoAPI = () => 
    axiosClient.get('/me/bank-info').then(res => res.data);

export const createWithdrawalAPI = (payload: { amount: number; currency: string; security_pin: string }) => 
    axiosClient.post('/withdrawals', payload).then(res => res.data);

export const getWithdrawalByIdAPI = (withdrawalId: string) => 
    axiosClient.get(`/withdrawals/${withdrawalId}`).then(res => res.data);

export const listBetsAPI = (params: { page: number; page_size: number }) => 
    axiosClient.get('/bets', { params }).then(res => res.data);

export const listWalletTransactionsAPI = (params: { page: number; page_size: number; type?: string }) => 
    axiosClient.get('/me/wallet/transactions', { params }).then(res => res.data);

export const getThreeDHistoryAPI = () => 
    axiosClient.get('/three-d-results/history').then(res => res.data);

export const createMyBankInfoAPI = (payload: { bank_name: string; account_name: string; account_number: string }) => 
    axiosClient.post('/me/bank-info', payload).then(res => res.data);

export const updateMyBankInfoAPI = (payload: { bank_name: string; account_name: string; account_number: string }) => 
    axiosClient.put('/me/bank-info', payload).then(res => res.data);

export const logoutAllFcmTokensAPI = () => 
    axiosClient.post('/fcm/logout-all').then(res => res.data);

export const createBetAPI = (payload: { 
    bet_type: string; 
    currency: string; 
    security_pin: string; 
    target_opentime?: string; 
    bet_numbers: { number: string; amount: number }[] 
}) => 
    axiosClient.post('/bets', payload).then(res => res.data);

export const listNotificationLogsAPI = (params: { page: number; per_page: number }) => 
    axiosClient.get('/notifications/logs', { params }).then(res => res.data);

export const markAllNotificationsAsReadAPI = () => 
    axiosClient.post('/notifications/read-all').then(res => res.data);

export const listActivePopupAdsAPI = () => 
    axiosClient.get('/popup-ads').then(res => res.data);


export const downloadPopupAdImageAPI = (id: string | number) => 
    axiosClient.get(`/popup-ads/${id}/image`, { responseType: 'arraybuffer' })
        .then(res => res?.data ?? res);

export const getMaintenanceSettingsAPI = () => 
    axiosClient.get('/app-settings/maintenance').then(res => res.data);

export const createFcmTokenAPI = (payload: { token: string; device_type: string; device_name?: string }) => 
    axiosClient.post('/fcm/token', payload).then(res => res.data);

/** Releases just this device. axios only sends a DELETE body when it is under `data`. */
export const deleteFcmTokenAPI = (token: string) => 
    axiosClient.delete('/fcm/token', { data: { token } }).then(res => res.data);