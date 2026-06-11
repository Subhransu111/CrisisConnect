import React from 'react'
import SplashScreen from './components/sections/SplashScreen'
import Hero from './components/sections/Hero'
import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard"

const App = () => {
  return (
    <div>
      <SplashScreen />
      <Hero />
    </div>
  )
}

export default App