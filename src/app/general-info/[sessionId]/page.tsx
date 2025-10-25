"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Users, Building, ArrowRight } from 'lucide-react'

interface GeneralInfoPageProps {
  params: {
    sessionId: string
  }
}

export default function GeneralInfoPage({ params }: GeneralInfoPageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectType: '',
    housingType: '',
    housingTypeOther: '',
    propertyUsage: '',
    householdAdults: '',
    householdChildren: '',
    householdGrandchildren: '',
    childrenAges: '',
    hasAnimals: null as boolean | null,
    desiredOrganization: '',
    organizationComments: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectType || !formData.housingType || !formData.propertyUsage) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/client-sessions/${sessionId}/general-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectType: formData.projectType,
          housingType: formData.housingType,
          housingTypeOther: formData.housingType === 'other' ? formData.housingTypeOther : null,
          propertyUsage: formData.propertyUsage,
          householdAdults: formData.householdAdults ? parseInt(formData.householdAdults) : null,
          householdChildren: formData.householdChildren ? parseInt(formData.householdChildren) : null,
          householdGrandchildren: formData.householdGrandchildren ? parseInt(formData.householdGrandchildren) : null,
          childrenAges: formData.childrenAges || null,
          hasAnimals: formData.hasAnimals,
          desiredOrganization: formData.desiredOrganization || null,
          organizationComments: formData.organizationComments || null
        })
      })

      if (response.ok) {
        router.push(`/room-selection/${sessionId}`)
      } else {
        const data = await response.json()
        alert(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-10 w-10 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Informations générales
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Parlez-nous de votre projet architectural
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Type de projet */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-indigo-600" />
                Type de projet *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'construction', label: 'Construction neuve' },
                  { value: 'renovation', label: 'Rénovation' },
                  { value: 'extension', label: 'Extension / surélévation' },
                  { value: 'remodeling', label: 'Réaménagement intérieur' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.projectType === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="projectType"
                      value={option.value}
                      checked={formData.projectType === option.value}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type de logement */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2 text-indigo-600" />
                Type de logement *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'house', label: 'Maison' },
                  { value: 'apartment', label: 'Appartement' },
                  { value: 'other', label: 'Autre' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.housingType === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="housingType"
                      value={option.value}
                      checked={formData.housingType === option.value}
                      onChange={(e) => setFormData({ ...formData, housingType: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              
              {formData.housingType === 'other' && (
                <input
                  type="text"
                  value={formData.housingTypeOther}
                  onChange={(e) => setFormData({ ...formData, housingTypeOther: e.target.value })}
                  placeholder="Précisez..."
                  className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                />
              )}
            </div>

            {/* Usage du bien */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Usage du bien *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'primary', label: 'Résidence principale' },
                  { value: 'secondary', label: 'Résidence secondaire' },
                  { value: 'rental', label: 'Location / gîte / bureau' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.propertyUsage === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="propertyUsage"
                      value={option.value}
                      checked={formData.propertyUsage === option.value}
                      onChange={(e) => setFormData({ ...formData, propertyUsage: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Composition du foyer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Composition du foyer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adultes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.householdAdults}
                    onChange={(e) => setFormData({ ...formData, householdAdults: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enfants
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.householdChildren}
                    onChange={(e) => setFormData({ ...formData, householdChildren: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Petits-enfants
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.householdGrandchildren}
                    onChange={(e) => setFormData({ ...formData, householdGrandchildren: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Âge des enfants (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.childrenAges}
                  onChange={(e) => setFormData({ ...formData, childrenAges: e.target.value })}
                  placeholder="Ex: 5 ans, 8 ans, 12 ans"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animaux
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all flex-1 ${
                    formData.hasAnimals === true
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="hasAnimals"
                      checked={formData.hasAnimals === true}
                      onChange={() => setFormData({ ...formData, hasAnimals: true })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">Oui</span>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all flex-1 ${
                    formData.hasAnimals === false
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="hasAnimals"
                      checked={formData.hasAnimals === false}
                      onChange={() => setFormData({ ...formData, hasAnimals: false })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">Non</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Organisation souhaitée */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Organisation souhaitée
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'single_story', label: 'Plain-pied' },
                  { value: 'multi_story', label: 'Maison à étage(s)' },
                  { value: 'elevation', label: 'Surélévation' },
                  { value: 'extension', label: 'Extension' },
                  { value: 'unsure', label: 'Je ne sais pas encore' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.desiredOrganization === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="desiredOrganization"
                      value={option.value}
                      checked={formData.desiredOrganization === option.value}
                      onChange={(e) => setFormData({ ...formData, desiredOrganization: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire libre sur l'organisation (optionnel)
                </label>
                <textarea
                  value={formData.organizationComments}
                  onChange={(e) => setFormData({ ...formData, organizationComments: e.target.value })}
                  rows={3}
                  placeholder="Décrivez vos souhaits d'organisation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || !formData.projectType || !formData.housingType || !formData.propertyUsage}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center text-lg disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
