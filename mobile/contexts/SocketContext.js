import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5000';

const SocketContext = createContext({});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // Créer la connexion WebSocket
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket подключен');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket отключен:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Ошибка подключения WebSocket:', error);
    });

    setSocket(newSocket);

    // Nettoyage
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  const joinLive = (liveId) => {
    if (socket && isConnected) {
      socket.emit('join-live', liveId);
    }
  };

  const leaveLive = (liveId) => {
    if (socket && isConnected) {
      socket.emit('leave-live', liveId);
    }
  };

  const sendLiveMessage = (liveId, message, user) => {
    if (socket && isConnected) {
      socket.emit('live-message', {
        liveId,
        message,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        }
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinLive,
        leaveLive,
        sendLiveMessage
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
