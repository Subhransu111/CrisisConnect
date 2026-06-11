import { io } from "socket.io-client"

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
    })
  }
  return socket
}

export const connectSocket = (token) => {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}