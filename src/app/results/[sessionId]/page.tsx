"use client"

import React, { useState, useEffect } from 'react'
import { Home, User, Heart, MessageSquare, Download, Share } from 'lucide-react'
import Image from 'next/image'

interface ClientSession {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
}

interface Answer {
  id: string
  answerValue: string
  question: {
    questionText: string
    roomType: {
      name: string
    }
  }
}

interface PhotoInteraction {
  id: string
  action: string
  annotationsJson: string | null
  photo: {
    imageUrl: string
    title: string | null
    description: string | null
    tags: string | null
  }
}

interface ResultsPageProps {
  params: {
    sessionId: string
  }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = React.use(params)
  const [session, setSession] = useState<ClientSession | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [likedPhotos, setLikedPhotos] = useState<PhotoInteraction[]>([])
  const [clientPhotos, setClientPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      // Marquer la session comme terminée (si elle ne l'est pas déjà)
      await fetch(`/api/client-sessions/${sessionId}/complete`, {
        method: 'PATCH'
      }).catch(console.warn) // Ne pas bloquer si ça échoue

      // Charger les données de session avec les réponses
      const sessionsResponse = await fetch(`/api/client-sessions?architectId=demo-architect-id`)
      const sessionsData = await sessionsResponse.json()

      if (sessionsResponse.ok) {
        const currentSession = sessionsData.sessions?.find((s: any) => s.id === sessionId)
        if (currentSession) {
          setSession(currentSession)
          setAnswers(currentSession.clientAnswers || [])
        }
      }

      // Charger les interactions avec les photos
      const interactionsResponse = await fetch(`/api/photo-interactions?sessionId=${sessionId}`)
      const interactionsData = await interactionsResponse.json()

      if (interactionsResponse.ok) {
        const liked = interactionsData.interactions?.filter((i: any) => i.action === 'like') || []
        setLikedPhotos(liked)
      }

      // Charger les photos uploadées par le client
      const photosResponse = await fetch(`/api/inspiration-photos?sessionId=${sessionId}`)
      const photosData = await photosResponse.json()

      if (photosResponse.ok) {
        const uploaded = photosData.photos?.filter((p: any) => p.isClientUpload) || []
        setClientPhotos(uploaded)
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const groupAnswersByRoom = (answers: Answer[]) => {
    return answers.reduce((acc, answer) => {
      const roomName = answer.question.roomType.name
      if (!acc[roomName]) {
        acc[roomName] = []
      }
      acc[roomName].push(answer)
      return acc
    }, {} as Record<string, Answer[]>)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session non trouvée</h1>
        </div>
      </div>
    )
  }

  const groupedAnswers = groupAnswersByRoom(answers)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Home className="h-10 w-10 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Votre Profil Architectural
              </h1>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {session.firstName} {session.lastName}
              </h2>
              <p className="text-gray-600">{session.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Évaluation réalisée le {formatDate(session.createdAt)}
              </p>
            </div>
          </div>

          {/* Réponses par pièce */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {Object.entries(groupedAnswers).map(([roomName, roomAnswers]) => (
              <div key={roomName} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
                  {roomName}
                </h3>
                <div className="space-y-3">
                  {roomAnswers.map((answer) => (
                    <div key={answer.id}>
                      <p className="text-sm font-medium text-gray-700">
                        {answer.question.questionText}
                      </p>
                      <p className="text-gray-600 mt-1">
                        {answer.answerValue.startsWith('[') 
                          ? JSON.parse(answer.answerValue).join(', ')
                          : answer.answerValue
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Photos uploadées par le client */}
          {clientPhotos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 text-indigo-600 mr-2" />
                Vos photos personnelles ({clientPhotos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={photo.imageUrl}
                        alt={photo.title || 'Votre photo'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    {photo.title && (
                      <p className="mt-2 text-sm text-gray-700">{photo.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos aimées */}
          {likedPhotos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="h-5 w-5 text-pink-600 mr-2" />
                Vos inspirations préférées ({likedPhotos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedPhotos.map((interaction) => (
                  <div key={interaction.id} className="relative group">
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={interaction.photo.imageUrl}
                        alt={interaction.photo.title || 'Inspiration'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="mt-3">
                      {interaction.photo.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {interaction.photo.title}
                        </h4>
                      )}
                      {interaction.annotationsJson && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1 flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Vos commentaires :
                          </p>
                          {JSON.parse(interaction.annotationsJson).map((annotation: any, index: number) => (
                            <p key={index} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded mb-1">
                              • {annotation.comment}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Et maintenant ?
            </h3>
            <p className="text-gray-600 mb-6">
              Votre architecte a maintenant toutes les informations nécessaires pour vous accompagner 
              dans la réalisation de votre projet. Vous recevrez prochainement un email avec la suite 
              de votre projet personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                <Download className="h-5 w-5 mr-2" />
                Télécharger le PDF
              </button>
              <button className="flex items-center justify-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                <Share className="h-5 w-5 mr-2" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}