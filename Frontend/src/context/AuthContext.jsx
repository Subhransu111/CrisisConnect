// controls the login state for the whole frontend

// stores: { who logged in , user token , loading state , login function , logout function }

import { createContext, useContext, useState, useEffect } from "react"
import api from "../lib/axios"
import { connectSocket, disconnectSocket } from "../lib/socket"

const AuthContext = createContext(null)

// children -> anything {Any Component} that wraps around the authProvider 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user")
    return saved ? JSON.parse(saved) : null   // ? indicates like if else 
  })
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return }
      try {
        const res = await api.get("/auth/me")
        setUser(res.data.user)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        connectSocket(token)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", authToken)
    connectSocket(authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    disconnectSocket()
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)