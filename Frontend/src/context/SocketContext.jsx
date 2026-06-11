import { createContext, useContext, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socket = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    socket.current = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("token") }
    })

    socket.current.on("connect", () => {
      console.log("Socket connected")
    })

    return () => socket.current?.disconnect()
  }, [user])

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)