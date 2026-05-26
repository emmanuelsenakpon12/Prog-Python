"use client"
import React from 'react'

type Props = {
  amount: number | string
  currency?: string
  backendEndpoint?: string
  redirect_url?: string
}

export default function FlutterwavePay({ amount, currency = 'USD', backendEndpoint = '/backend/flutterwave_create_payment.php', redirect_url = window?.location?.href } : Props) {
  const [loading, setLoading] = React.useState(false)

  async function handlePay() {
    try {
      setLoading(true)
      const res = await fetch(backendEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ amount: String(amount), currency, redirect_url })
      })
      const json = await res.json()
      // Flutterwave returns a link in data.link when successful
      const link = (json?.data?.link) || (json?.data?.meta?.authorization?.redirect)
      if (link) {
        window.location.href = link
        return
      }
      alert('Impossible de créer le paiement (voir console)')
      console.error('create payment response', json)
    } catch (e) {
      console.error(e)
      alert('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading} className="btn btn-primary">
      {loading ? 'Traitement...' : `Payer ${amount} ${currency}`}
    </button>
  )
}
