import { ref, shallowRef, readonly } from 'vue';
import { io } from 'socket.io-client';
import { getToken } from '@/utils/auth';

const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

/**
 * 取得 WebSocket 連線 URL
 * dev 環境走 Vite proxy（/hostApi → localhost:3000），production 直接連 API URL
 *
 * 注意：socket.io 會把 URL path 當作 namespace，不是 HTTP path。
 * 所以 dev 只給 origin，透過 path 選項讓 HTTP 請求走 /hostApi/socket.io
 */
const getSocketUrl = () => {
  if (isDevelopment) {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_AXIOS_BASEURL || window.location.origin;
};

// 模組層級單例，確保整個應用只有一個 socket 連線
let socket = null;
const connected = ref(false);
const connectionError = ref(null);
const incomingCall = shallowRef(null);

/**
 * CTI WebSocket Composable
 * 連線到後端 /cti namespace，監聽來電通知
 */
export const useCtiSocket = () => {
  const connect = () => {
    const token = getToken();
    if (!token) {
      connectionError.value = '尚未登入，無法建立 CTI 連線';
      return;
    }

    // 避免重複連線
    if (socket?.connected) return;

    // 若已有斷開的 socket，先清理
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    const url = getSocketUrl();

    const options = {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
    };

    // dev 環境：讓 socket.io HTTP 請求走 Vite proxy /hostApi
    // e.g. /hostApi/socket.io/?EIO=4&transport=... → proxy → localhost:3000/socket.io/?...
    if (isDevelopment) {
      options.path = '/hostApi/socket.io';
    }

    socket = io(`${url}/cti`, options);

    socket.on('connect', () => {
      connected.value = true;
      connectionError.value = null;
      console.log('[CTI] WebSocket 已連線');
    });

    socket.on('connected', (data) => {
      console.log('[CTI] 伺服器確認:', data.message);
    });

    socket.on('disconnect', (reason) => {
      connected.value = false;
      console.log('[CTI] WebSocket 已斷線:', reason);
    });

    socket.on('connect_error', (error) => {
      connected.value = false;
      connectionError.value = error.message;
      console.error('[CTI] 連線錯誤:', error.message);
    });

    socket.on('error', (data) => {
      connectionError.value = data.message;
      console.error('[CTI] 伺服器錯誤:', data.message);
    });

    socket.on('incoming-call', (data) => {
      console.log('[CTI] 收到來電通知:', data);
      incomingCall.value = { ...data, _receivedAt: Date.now() };
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    connected.value = false;
    connectionError.value = null;
  };

  return {
    connected: readonly(connected),
    connectionError: readonly(connectionError),
    incomingCall: readonly(incomingCall),
    connect,
    disconnect,
  };
};
