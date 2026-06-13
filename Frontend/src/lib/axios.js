// API CONNECTION


import axios from "axios"

// Custom axios instance - reusable api object instead of full backend url again and again
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    timeout: 10000,
})


// request interceptor : before every request goes to backend it attaches the token , headers 

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token")

    if (token) config.headers.Authorization = `Bearer ${token}`
    return config

})

// response is intercepted if there is error else continue to proceed 
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

export default api