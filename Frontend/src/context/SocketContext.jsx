import { createContext, useContext, useEffect, useState } from "react"
import { getSocket, connectSocket } from "../lib/socket"
import { useAuth } from "./AuthContext"

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!token) return
    const s = connectSocket(token)
    setSocket(s)
    return () => {}
  }, [token])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)