"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, X, MessageCircle, ArrowRight } from 'lucide-react'
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
  const [likedPhotos, setLikedPhotos] = useState<InspirationPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [phase, setPhase] = useState<'rating' | 'annotation' | 'upload' | 'complete'>('rating')
  const [annotationsByPhoto, setAnnotationsByPhoto] = useState<Record<string, Annotation[]>>({})
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>([])

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      // Récupérer les pièces sélectionnées par le client
      const sessionResponse = await fetch(`/api/client-sessions/${sessionId}`)
      const sessionData = await sessionResponse.json()
      
      if (!sessionResponse.ok) {
        console.error('Erreur session:', sessionData.error)
        router.push(`/results/${sessionId}`)
        return
      }

      const selectedRoomIds = sessionData.session.selectedRoomTypes 
        ? JSON.parse(sessionData.session.selectedRoomTypes)
        : []

      // Charger les photos filtrées selon les pièces sélectionnées
      const response = await fetch(
        `/api/inspiration-photos?architectId=demo-architect-id&selectedRoomIds=${encodeURIComponent(JSON.stringify(selectedRoomIds))}`
      )
      const data = await response.json()
      
      if (response.ok && data.photos && data.photos.length > 0) {
        setPhotos(data.photos)
      } else {
        // Pas de photos, aller directement aux résultats
        router.push(`/results/${sessionId}`)
        return
      }
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
      router.push(`/results/${sessionId}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Phase 1: Rating (Like/Dislike)
  const handleRating = async (action: 'like' | 'dislike') => {
    try {
      const currentPhoto = photos[currentPhotoIndex]
      
      // Si like, ajouter à la liste des photos likées
      if (action === 'like') {
        setLikedPhotos(prev => [...prev, currentPhoto])
      }

      // Sauvegarder l'interaction (sans annotations pour l'instant)
      await fetch('/api/photo-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          photoId: currentPhoto.id,
          action,
          annotationsJson: null
        })
      })

      // Passer à la photo suivante ou à la phase d'annotation
      if (currentPhotoIndex < photos.length - 1) {
        setCurrentPhotoIndex(prev => prev + 1)
      } else {
        // Toutes les photos ont été notées
        if (likedPhotos.length > 0 || action === 'like') {
          // Il y a des photos likées, passer à la phase d'annotation
          const finalLikedPhotos = action === 'like' ? [...likedPhotos, currentPhoto] : likedPhotos
          setLikedPhotos(finalLikedPhotos)
          setPhase('annotation')
          setCurrentPhotoIndex(0)
        } else {
          // Aucune photo likée, terminer
          setPhase('complete')
        }
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Phase 2: Annotation
  const handleAnnotationSave = async () => {
    const currentPhoto = likedPhotos[currentPhotoIndex]
    
    try {
      // Mettre à jour l'interaction avec les annotations
      const annotationsJson = currentAnnotations.length > 0 ? JSON.stringify(currentAnnotations) : null

      await fetch('/api/photo-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          photoId: currentPhoto.id,
          action: 'like',
          annotationsJson
        })
      })

      // Sauvegarder les annotations localement
      setAnnotationsByPhoto(prev => ({
        ...prev,
        [currentPhoto.id]: currentAnnotations
      }))

      // Passer à la photo likée suivante ou à l'upload
      if (currentPhotoIndex < likedPhotos.length - 1) {
        setCurrentPhotoIndex(prev => prev + 1)
        setCurrentAnnotations(annotationsByPhoto[likedPhotos[currentPhotoIndex + 1]?.id] || [])
      } else {
        // Fin des annotations, passer à l'upload de photos personnelles
        router.push(`/personal-photos/${sessionId}`)
      }

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleSkipAnnotations = () => {
    // Passer directement à l'upload de photos personnelles sans annoter
    router.push(`/personal-photos/${sessionId}`)
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'annotation') return // Annotations uniquement en phase d'annotation

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const comment = prompt("Qu'aimez-vous dans cette zone ?")
    if (comment) {
      setCurrentAnnotations(prev => [...prev, { x, y, comment }])
    }
  }

  const currentPhoto = phase === 'rating' ? photos[currentPhotoIndex] : likedPhotos[currentPhotoIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Protection: si pas de photo courante, rediriger
  if (!currentPhoto && !isLoading && phase !== 'complete') {
    console.error('Aucune photo disponible')
    router.push(`/results/${sessionId}`)
    return null
  }

  if (phase === 'complete') {
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

  const totalPhotos = phase === 'rating' ? photos.length : likedPhotos.length
  const progress = ((currentPhotoIndex + 1) / totalPhotos) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {phase === 'rating' ? 'Inspirations' : 'Annotez vos coups de cœur'}
            </h1>
            
            {phase === 'annotation' && (
              <p className="text-sm text-indigo-600 mb-4">
                👉 Marquez ce que vous aimez sur chaque photo
              </p>
            )}
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600">
              Photo {currentPhotoIndex + 1} sur {totalPhotos}
              {phase === 'annotation' && ` • ${likedPhotos.length} photo${likedPhotos.length > 1 ? 's' : ''} likée${likedPhotos.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Photo Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div 
              className="relative h-96" 
              onClick={handleImageClick}
              style={{ cursor: phase === 'annotation' ? 'crosshair' : 'default' }}
            >
              <Image
                src={currentPhoto?.imageUrl || ''}
                alt={currentPhoto?.title || 'Inspiration'}
                fill
                className="object-cover"
              />
              
              {/* Annotations */}
              {phase === 'annotation' && currentAnnotations.map((annotation, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
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
              {currentPhoto?.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentPhoto.title}
                </h3>
              )}
              {currentPhoto?.description && (
                <p className="text-gray-600 mb-4">
                  {currentPhoto.description}
                </p>
              )}
              
              {/* Tags */}
              {currentPhoto?.tags && (
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

          {/* Annotation Section - visible uniquement en phase d'annotation */}
          {phase === 'annotation' && (
            <div className="bg-indigo-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-600 rounded-full p-2 mr-3">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-indigo-900">Annotez cette photo</h3>
                  <p className="text-sm text-indigo-700">
                    Cliquez sur l'image pour marquer les éléments que vous appréciez
                  </p>
                </div>
              </div>
              
              {currentAnnotations.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-indigo-900 mb-2">Vos annotations ({currentAnnotations.length}) :</p>
                  {currentAnnotations.map((annotation, index) => (
                    <div key={index} className="flex items-start bg-white rounded-lg p-3">
                      <span className="flex-shrink-0 inline-block w-6 h-6 bg-indigo-600 text-white rounded-full text-center text-xs leading-6 mr-3">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{annotation.comment}</p>
                      <button
                        onClick={() => setCurrentAnnotations(prev => prev.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-red-600 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleAnnotationSave}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
                >
                  {currentPhotoIndex < likedPhotos.length - 1 ? 'Photo suivante' : 'Terminer'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                {currentPhotoIndex === 0 && (
                  <button
                    onClick={handleSkipAnnotations}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Passer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - visible uniquement en phase de rating */}
          {phase === 'rating' && (
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleRating('dislike')}
                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-full transition-colors"
              >
                <X className="h-8 w-8 text-gray-600" />
              </button>

              <button
                onClick={() => handleRating('like')}
                className="bg-pink-100 hover:bg-pink-200 p-4 rounded-full transition-colors"
              >
                <Heart className="h-8 w-8 text-pink-600" />
              </button>
            </div>
          )}

          {/* Instructions */}
          {phase === 'rating' && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                ❤️ J'aime • ✖️ Je n'aime pas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}