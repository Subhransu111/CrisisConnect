import { useState } from "react";

export function useGeolocation() {
    const [coords, setCoords] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser")
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
  }

  return { coords, error, loading, getLocation }
}




