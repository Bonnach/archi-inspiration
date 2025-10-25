"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Check, ArrowRight } from 'lucide-react'

interface RoomType {
  id: string
  name: string
  displayOrder: number
  parentId: string | null
  children?: RoomType[]
}

interface RoomSelectionPageProps {
  params: {
    sessionId: string
  }
}

export default function RoomSelectionPage({ params }: RoomSelectionPageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)
  
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadRoomTypes()
  }, [])

  const loadRoomTypes = async () => {
    try {
      const response = await fetch(`/api/room-types?architectId=demo-architect-id&includeChildren=true`)
      const data = await response.json()
      
      if (response.ok) {
        // Filtrer pour ne garder que les catégories principales (parents)
        const categories = data.roomTypes.filter((rt: RoomType) => rt.parentId === null)
        setRoomTypes(categories)
      } else {
        console.error('Erreur:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRoom = (roomId: string) => {
    setSelectedRooms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomId)) {
        newSet.delete(roomId)
      } else {
        newSet.add(roomId)
      }
      return newSet
    })
  }

  const handleContinue = async () => {
    if (selectedRooms.size === 0) {
      alert('Veuillez sélectionner au moins une pièce')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/client-sessions/${sessionId}/room-selection`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedRoomTypes: Array.from(selectedRooms)
        })
      })

      if (response.ok) {
        router.push(`/questionnaire/${sessionId}`)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Home className="h-10 w-10 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Sélectionnez vos pièces
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Choisissez les types de pièces concernés par votre projet architectural
            </p>
          </div>

          {/* Categories and Rooms */}
          <div className="space-y-6 mb-8">
            {roomTypes
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => (
                <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {category.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {category.children?.sort((a, b) => a.displayOrder - b.displayOrder).map((room) => {
                      const isSelected = selectedRooms.has(room.id)
                      return (
                        <button
                          key={room.id}
                          onClick={() => toggleRoom(room.id)}
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium flex-1 ${
                              isSelected ? 'text-indigo-900' : 'text-gray-700'
                            }`}>
                              {room.name}
                            </span>
                            {isSelected && (
                              <div className="flex-shrink-0 ml-2 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="text-center">

            {selectedRooms.size > 0 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <strong>{selectedRooms.size}</strong> pièce{selectedRooms.size > 1 ? 's' : ''} sélectionnée{selectedRooms.size > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isSubmitting || selectedRooms.size === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center text-lg disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Continuer vers le questionnaire
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
