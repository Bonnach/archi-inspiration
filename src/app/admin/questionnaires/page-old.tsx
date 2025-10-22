"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Edit,
  Trash2,
  FileText,
  Home,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: string
  optionsJson: string | null
  required: boolean
  displayOrder: number
  active: boolean
}

interface RoomType {
  id: string
  name: string
  displayOrder: number
  active: boolean
  questions: Question[]
}

export default function AdminQuestionnairesPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())

  useEffect(() => {
    const architectData = localStorage.getItem('architect')
    if (!architectData) {
      router.push('/admin/login')
      return
    }

    const parsedArchitect = JSON.parse(architectData)
    setArchitect(parsedArchitect)
    loadRoomTypes(parsedArchitect.id)
  }, [router])

  const loadRoomTypes = async (architectId: string) => {
    try {
      const response = await fetch(`/api/room-types?architectId=${architectId}`)
      const data = await response.json()

      if (response.ok) {
        setRoomTypes(data.roomTypes || [])
        // Expand all rooms by default
        setExpandedRooms(new Set(data.roomTypes?.map((rt: any) => rt.id) || []))
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms)
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId)
    } else {
      newExpanded.add(roomId)
    }
    setExpandedRooms(newExpanded)
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'select': return 'Choix unique'
      case 'multiple': return 'Choix multiple'
      case 'text': return 'Texte libre'
      case 'range': return 'Curseur'
      case 'boolean': return 'Oui/Non'
      default: return type
    }
  }

  const parseOptions = (optionsJson: string | null) => {
    if (!optionsJson) return []
    try {
      return JSON.parse(optionsJson)
    } catch {
      return []
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!architect) {
    return null
  }

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
                  Gestionnaire de questionnaires
                </h1>
                <p className="text-sm text-gray-500">
                  {roomTypes.length} types de pièces • {roomTypes.reduce((acc, rt) => acc + rt.questions.length, 0)} questions
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle pièce
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle question
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {roomTypes.length > 0 ? (
          <div className="space-y-6">
            {roomTypes.map((roomType) => (
              <div key={roomType.id} className="bg-white rounded-lg shadow">
                <div 
                  className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRoom(roomType.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {expandedRooms.has(roomType.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <Home className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {roomType.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {roomType.questions.length} question{roomType.questions.length > 1 ? 's' : ''}
                          {!roomType.active && ' • Inactif'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        roomType.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {roomType.active ? 'Actif' : 'Inactif'}
                      </span>
                      <button 
                        className="p-1 text-gray-400 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedRooms.has(roomType.id) && (
                  <div className="px-6 py-4">
                    {roomType.questions.length > 0 ? (
                      <div className="space-y-4">
                        {roomType.questions
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((question, index) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium mr-3">
                                    Q{index + 1}
                                  </span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium mr-2">
                                    {getQuestionTypeLabel(question.questionType)}
                                  </span>
                                  {question.required && (
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                                      Obligatoire
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-gray-900 font-medium mb-2">
                                  {question.questionText}
                                </p>
                                
                                {question.optionsJson && (
                                  <div className="flex flex-wrap gap-2">
                                    {parseOptions(question.optionsJson).map((option: string, optIndex: number) => (
                                      <span
                                        key={optIndex}
                                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                      >
                                        {option}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  question.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {question.active ? 'Active' : 'Inactive'}
                                </span>
                                <button className="p-1 text-gray-400 hover:text-blue-600">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une question à {roomType.name}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">
                          Aucune question pour {roomType.name}
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter la première question
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun questionnaire configuré
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par créer des types de pièces et leurs questions associées
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto">
              <Plus className="h-4 w-4 mr-2" />
              Créer votre premier questionnaire
            </button>
          </div>
        )}
      </div>
    </div>
  )
}