// src/utils/token.js
import { jwtDecode } from 'jwt-decode' // Korrigierter Import

export function getTokenData(key = null) {
  try {
    // Token aus Cookie holen
    const token = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('token='))
      ?.split('=')[1]

    if (!token) return null

    // Token dekodieren
    const decoded = jwtDecode(token)

    // Wenn kein spezieller Key angefragt wurde, gib das ganze Objekt zurück
    if (!key) return decoded

    // Ansonsten gib den spezifischen Wert zurück
    return decoded[key]
  } catch (error) {
    console.error('Error reading token:', error)
    return null
  }
}
