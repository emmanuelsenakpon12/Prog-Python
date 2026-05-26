'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    // Get transaction reference from URL params
    const txRef = searchParams?.get('tx_ref')
    const status_param = searchParams?.get('status')
    
    if (status_param === 'successful') {
      setStatus('success')
    } else if (status_param === 'cancelled') {
      setStatus('cancelled')
    } else {
      setStatus('pending')
    }
  }, [searchParams])

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Paiement réussi !</h1>
          <p className="text-gray-600 mb-6">Votre transaction a été traitée avec succès.</p>
          <div className="space-y-3">
            <Link href="/offers" className="block w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
              Retour aux offres
            </Link>
            <Link href="/profile" className="block w-full bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300">
              Voir mes réservations
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Paiement annulé</h1>
          <p className="text-gray-600 mb-6">Votre paiement a été annulé.</p>
          <div className="space-y-3">
            <Link href="/checkout" className="block w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
              Réessayer le paiement
            </Link>
            <Link href="/offers" className="block w-full bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300">
              Retour aux offres
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Traitement en cours...</h1>
        <p className="text-gray-600 mb-6">Votre paiement est en cours de vérification.</p>
      </div>
    </div>
  )
}
