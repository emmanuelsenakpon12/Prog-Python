'use client'

import React, { useState } from 'react'
import FlutterwavePay from '@/components/flutterwave-pay'

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    amount: '50',
    currency: 'USD',
    description: 'Booking payment'
  })
  const [readyToPay, setReadyToPay] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.phone || !formData.amount) {
      alert('Veuillez remplir tous les champs')
      return
    }
    setReadyToPay(true)
  }

  if (readyToPay) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Résumé du paiement</h2>
          <div className="space-y-2 mb-6 border-b pb-4">
            <p><strong>Nom :</strong> {formData.fullName}</p>
            <p><strong>Email :</strong> {formData.email}</p>
            <p><strong>Téléphone :</strong> {formData.phone}</p>
            <p className="text-lg font-semibold mt-4">
              Montant : {formData.amount} {formData.currency}
            </p>
          </div>
          <div className="space-y-3">
            <FlutterwavePay
              amount={formData.amount}
              currency={formData.currency}
              redirect_url={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`}
            />
            <button
              onClick={() => setReadyToPay(false)}
              className="w-full btn btn-secondary"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Paiement Sécurisé</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jean@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+33 6 12 34 56 78"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Montant</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Devise</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GHS">GHS</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          >
            Continuer vers le paiement
          </button>
        </form>
      </div>
    </div>
  )
}
