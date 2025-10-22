"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, X, Eye, MessageCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface InspirationPhoto {
  id: string
  imageUrl: string
  title: string | null
  description: string | null
  tags: string | null
}

interface Annotation {
  x: number
  y: number
  comment: string
}

interface InspirationsPageProps {
  params: {
    sessionId: string
  }
}

export default function InspirationsPage({ params }: InspirationsPageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)

  const [photos, setPhotos] = useState<InspirationPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      const response = await fetch('/api/inspiration-photos?architectId=demo-architect-id')
      const data = await response.json()
      
      if (response.ok) {
        setPhotos(data.photos)
      } else {
        console.error('Erreur:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (photoId: string, action: 'like' | 'dislike') => {
    try {
      const annotationsJson = annotations.length > 0 ? JSON.stringify(annotations) : null

      await fetch('/api/photo-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          photoId,
          action,
          annotationsJson
        })
      })

      // Passer à la photo suivante
      if (currentPhotoIndex < photos.length - 1) {
        setCurrentPhotoIndex(prev => prev + 1)
        setAnnotations([])
        setShowAnnotations(false)
      } else {
        // Toutes les photos ont été vues
        setIsComplete(true)
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showAnnotations) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const comment = prompt("Qu'est-ce que vous aimez ici ?")
    if (comment) {
      setAnnotations(prev => [...prev, { x, y, comment }])
    }
  }

  const currentPhoto = photos[currentPhotoIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (isComplete || !currentPhoto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Heart className="h-8 w-8 text-green-600 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Merci pour votre participation !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre architecte va pouvoir analyser vos préférences pour mieux vous accompagner dans votre projet.
          </p>
          <button
            onClick={() => router.push(`/results/${sessionId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
          >
            Voir mon profil
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentPhotoIndex + 1) / photos.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Inspirations
            </h1>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600">
              Photo {currentPhotoIndex + 1} sur {photos.length}
            </p>
          </div>

          {/* Photo Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="relative h-96" onClick={handleImageClick}>
              <Image
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title || 'Inspiration'}
                fill
                className="object-cover cursor-pointer"
              />
              
              {/* Annotations */}
              {annotations.map((annotation, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${annotation.x}%`, 
                    top: `${annotation.y}%` 
                  }}
                  title={annotation.comment}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Photo Info */}
            <div className="p-6">
              {currentPhoto.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentPhoto.title}
                </h3>
              )}
              {currentPhoto.description && (
                <p className="text-gray-600 mb-4">
                  {currentPhoto.description}
                </p>
              )}
              
              {/* Tags */}
              {currentPhoto.tags && (
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(currentPhoto.tags).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Annotation Mode Toggle */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showAnnotations 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {showAnnotations ? 'Annoter' : 'Mode annotation'}
            </button>
          </div>

          {showAnnotations && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Cliquez sur l'image pour marquer ce que vous aimez
              </p>
              {annotations.length > 0 && (
                <div className="space-y-2">
                  {annotations.map((annotation, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <span className="inline-block w-6 h-6 bg-indigo-600 text-white rounded-full text-center text-xs leading-6 mr-2">
                        {index + 1}
                      </span>
                      {annotation.comment}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleLike(currentPhoto.id, 'dislike')}
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-full transition-colors"
            >
              <X className="h-8 w-8 text-gray-600" />
            </button>

            <button
              onClick={() => handleLike(currentPhoto.id, 'like')}
              className="bg-pink-100 hover:bg-pink-200 p-4 rounded-full transition-colors"
            >
              <Heart className="h-8 w-8 text-pink-600" />
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              ❤️ J'aime • ✖️ Je n'aime pas • 💬 Annoter ce que j'aime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}