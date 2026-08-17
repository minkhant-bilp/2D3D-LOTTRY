import { axiosClient } from './axiosClient';

export const getMe = async () => {
    const response: any = await axiosClient.get('/me');
    return response;
};

export const getMyWallet = async () => {
    const response: any = await axiosClient.get('/me/wallet');
    return response;
};

export const getNotificationStats = async () => {
    const response: any = await axiosClient.get('/notifications/stats');
    return response;
};

export const getTwoDLive = async () => {
    const response: any = await axiosClient.get('/two-d-results/live');
    return response;
};

export const listTwoDResultsLastFiveDays = async () => {
    const response: any = await axiosClient.get('/two-d-results/last-5-days');
    return response;
};

export const listTwoDSideNumbersLastFiveDays = async () => {
    const response: any = await axiosClient.get('/two-d-side-numbers/last-5-days');
    return response;
};


export const listBankSettingsAPI = async () => {
    const response: any = await axiosClient.get('/bank-settings');
    return response.data;
};

export const createDepositAPI = async (formData: FormData) => {
    const response: any = await axiosClient.post('/deposits', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const listWithdrawalsAPI = async (params: { page: number; page_size: number }) => {
    const response: any = await axiosClient.get('/withdrawals', { params });
    return response.data;
};

export const getMyBankInfoAPI = async () => {
    const response: any = await axiosClient.get('/me/bank-info');
    return response.data; 
};

export const createWithdrawalAPI = async (payload: { 
    amount: number; 
    currency: string; 
    security_pin: string 
}) => {
    const response: any = await axiosClient.post('/withdrawals', payload);
    return response.data;
};
export const listBetsAPI = async (params: { page: number; page_size: number }) => {
    const response: any = await axiosClient.get('/bets', { params });
    return response.data; 
};
export const listWalletTransactionsAPI = async (params: { page: number; page_size: number; type?: string }) => {
    const response: any = await axiosClient.get('/me/wallet/transactions', { params });
    return response.data; 
};
export const getThreeDHistoryAPI = async () => {
    const response: any = await axiosClient.get('/three-d-results/history');
    return response.data;
};

export const createMyBankInfoAPI = async (payload: { bank_name: string; account_name: string; account_number: string }) => {
    const response: any = await axiosClient.post('/me/bank-info', payload);
    return response.data;
};

export const updateMyBankInfoAPI = async (payload: { bank_name: string; account_name: string; account_number: string }) => {
    const response: any = await axiosClient.put('/me/bank-info', payload);
    return response.data;
};

export const logoutAllFcmTokensAPI = async () => {
    const response: any = await axiosClient.post('/fcm/logout-all');
    return response.data;
};

export const logoutUserAPI = async () => {
    const response: any = await axiosClient.post('/logout');
    return response.data;
};

export const createBetAPI = async (payload: { 
    bet_type: string; 
    currency: string; 
    security_pin: string; 
    target_opentime?: string; 
    bet_numbers: { number: string; amount: number }[] 
}) => {
    const response: any = await axiosClient.post('/bets', payload);
    return response.data;
};
export const listNotificationLogsAPI = async (params: { page: number; per_page: number }) => {
    const response: any = await axiosClient.get('/notifications/logs', { params });
    return response.data; 
};

export const markAllNotificationsAsReadAPI = async () => {
    const response: any = await axiosClient.post('/notifications/read-all');
    return response.data;
};