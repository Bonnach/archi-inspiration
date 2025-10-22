"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Calendar,
  MessageSquare,
  Heart,
  X,
  Download,
  Mail
} from 'lucide-react'
import Image from 'next/image'

interface ClientSession {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
  completedAt: string | null
  clientAnswers: Array<{
    id: string
    answerValue: string
    question: {
      questionText: string
      roomType: {
        name: string
      }
    }
  }>
  photoInteractions: Array<{
    id: string
    action: string
    annotationsJson: string | null
    photo: {
      imageUrl: string
      title: string | null
      description: string | null
      tags: string | null
    }
  }>
}

interface SessionPageProps {
  params: {
    sessionId: string
  }
}

export default function SessionPage({ params }: SessionPageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)
  const [architect, setArchitect] = useState<any>(null)
  const [session, setSession] = useState<ClientSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    const architectData = localStorage.getItem('architect')
    if (!architectData) {
      router.push('/admin/login')
      return
    }

    const parsedArchitect = JSON.parse(architectData)
    setArchitect(parsedArchitect)
    loadSession(parsedArchitect.id)
  }, [router])

  const loadSession = async (architectId: string) => {
    try {
      const response = await fetch(`/api/client-sessions?architectId=${architectId}`)
      const data = await response.json()

      if (response.ok) {
        const currentSession = data.sessions?.find((s: any) => s.id === sessionId)
        setSession(currentSession || null)
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const groupAnswersByRoom = (answers: any[]) => {
    return answers.reduce((acc, answer) => {
      const roomName = answer.question.roomType.name
      if (!acc[roomName]) {
        acc[roomName] = []
      }
      acc[roomName].push(answer)
      return acc
    }, {} as Record<string, any[]>)
  }

  const parseAnnotations = (annotationsJson: string | null) => {
    if (!annotationsJson) return []
    try {
      return JSON.parse(annotationsJson)
    } catch {
      return []
    }
  }

  const downloadPDF = async () => {
    if (!session) return
    
    setPdfLoading(true)
    try {
      // Ouvrir la page de rapport dans un nouvel onglet
      const reportUrl = `/api/client-sessions/${session.id}/pdf`
      window.open(reportUrl, '_blank')
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    } finally {
      setPdfLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session non trouvée</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  const groupedAnswers = groupAnswersByRoom(session.clientAnswers || [])
  const likedPhotos = session.photoInteractions?.filter(i => i.action === 'like') || []
  const dislikedPhotos = session.photoInteractions?.filter(i => i.action === 'dislike') || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {session.firstName} {session.lastName}
                </h1>
                <p className="text-sm text-gray-500">{session.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {session.status === 'completed' ? 'Terminée' : 'En cours'}
              </span>
              
              <button 
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                title="Télécharger le rapport PDF"
              >
                {pdfLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Mail className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Session */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations de la session
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Client</p>
                <p className="text-sm text-gray-600">{session.firstName} {session.lastName}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date de création</p>
                <p className="text-sm text-gray-600">{formatDate(session.createdAt)}</p>
              </div>
            </div>
            
            {session.completedAt && (
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Terminée le</p>
                  <p className="text-sm text-gray-600">{formatDate(session.completedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Réponses au questionnaire */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Réponses au questionnaire
            </h2>
            
            {Object.entries(groupedAnswers).map(([roomName, roomAnswers]) => (
              <div key={roomName} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  {roomName}
                </h3>
                
                <div className="space-y-4">
                  {roomAnswers.map((answer: any) => (
                    <div key={answer.id}>
                      <p className="text-sm font-medium text-gray-700">
                        {answer.question.questionText}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 pl-4 border-l-2 border-gray-200">
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

          {/* Photos aimées et commentaires */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Préférences visuelles
            </h2>
            
            {/* Photos aimées */}
            {likedPhotos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-4 w-4 text-pink-600 mr-2" />
                  Photos aimées ({likedPhotos.length})
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {likedPhotos.map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg overflow-hidden">
                      <div className="relative h-32">
                        <Image
                          src={interaction.photo.imageUrl}
                          alt={interaction.photo.title || 'Inspiration'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="p-3">
                        {interaction.photo.title && (
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {interaction.photo.title}
                          </h4>
                        )}
                        
                        {interaction.annotationsJson && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1 flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Commentaires :
                            </p>
                            {parseAnnotations(interaction.annotationsJson).map((annotation: any, index: number) => (
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
            
            {/* Photos non aimées */}
            {dislikedPhotos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <X className="h-4 w-4 text-gray-600 mr-2" />
                  Photos non aimées ({dislikedPhotos.length})
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {dislikedPhotos.map((interaction) => (
                    <div key={interaction.id} className="relative h-20 rounded-lg overflow-hidden opacity-60">
                      <Image
                        src={interaction.photo.imageUrl}
                        alt={interaction.photo.title || 'Inspiration'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {likedPhotos.length === 0 && dislikedPhotos.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">
                  Aucune interaction avec les photos d'inspiration pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}