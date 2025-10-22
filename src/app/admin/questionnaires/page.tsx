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
  ChevronRight,
  X,
  Save
} from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: 'text' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'range'
  optionsJson?: string | null
  options?: string[]
  required: boolean
  displayOrder: number
  active: boolean
  roomTypeId: string
}

interface RoomType {
  id: string
  name: string
  displayOrder: number
  active: boolean
  questions: Question[]
  architectId: string
}

export default function AdminQuestionnairesPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())
  
  // Modals states
  const [showAddRoomTypeModal, setShowAddRoomTypeModal] = useState(false)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [showEditRoomTypeModal, setShowEditRoomTypeModal] = useState(false)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  
  // Form states
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  
  // Form data
  const [roomTypeForm, setRoomTypeForm] = useState({ name: '', displayOrder: 0 })
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'text' as Question['questionType'],
    options: [''],
    required: true,
    displayOrder: 0
  })

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

  const getQuestionTypeLabel = (questionType: string) => {
    switch (questionType) {
      case 'select': return 'Choix unique'
      case 'multiselect': return 'Choix multiple'
      case 'text': return 'Texte libre'
      case 'textarea': return 'Texte long'
      case 'number': return 'Nombre'
      case 'range': return 'Curseur'
      case 'radio': return 'Radio'
      case 'checkbox': return 'Case à cocher'
      default: return questionType
    }
  }

  // CRUD Operations
  const handleAddRoomType = async () => {
    if (!architect || !roomTypeForm.name.trim()) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/room-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roomTypeForm,
          name: roomTypeForm.name.trim(),
          architectId: architect.id
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        await loadRoomTypes(architect.id)
        setShowAddRoomTypeModal(false)
        setRoomTypeForm({ name: '', displayOrder: 0 })
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditRoomType = async () => {
    if (!editingRoomType) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/room-types/${editingRoomType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomTypeForm)
      })

      const data = await response.json()
      
      if (response.ok) {
        await loadRoomTypes(architect.id)
        setShowEditRoomTypeModal(false)
        setEditingRoomType(null)
      } else {
        alert(data.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la modification')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de pièce ?')) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/room-types/${roomTypeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadRoomTypes(architect.id)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!selectedRoomTypeId || !questionForm.questionText.trim()) return
    
    setActionLoading(true)
    try {
      const options = ['select', 'multiselect', 'radio', 'checkbox'].includes(questionForm.questionType) 
        ? questionForm.options.filter(opt => opt.trim())
        : []
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionForm.questionText.trim(),
          type: questionForm.questionType,
          required: questionForm.required,
          displayOrder: questionForm.displayOrder,
          roomTypeId: selectedRoomTypeId,
          options
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        await loadRoomTypes(architect.id)
        setShowAddQuestionModal(false)
        setSelectedRoomTypeId(null)
        setQuestionForm({
          questionText: '',
          questionType: 'text',
          options: [''],
          required: true,
          displayOrder: 0
        })
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion) return
    
    setActionLoading(true)
    try {
      const options = ['select', 'multiselect', 'radio', 'checkbox'].includes(questionForm.questionType) 
        ? questionForm.options.filter(opt => opt.trim())
        : []
      
      const response = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionForm.questionText,
          type: questionForm.questionType,
          required: questionForm.required,
          displayOrder: questionForm.displayOrder,
          options
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        await loadRoomTypes(architect.id)
        setShowEditQuestionModal(false)
        setEditingQuestion(null)
      } else {
        alert(data.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la modification')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadRoomTypes(architect.id)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  // Modal handlers
  const openAddRoomTypeModal = () => {
    setRoomTypeForm({ name: '', displayOrder: roomTypes.length })
    setShowAddRoomTypeModal(true)
  }

  const openEditRoomTypeModal = (roomType: RoomType) => {
    setEditingRoomType(roomType)
    setRoomTypeForm({ name: roomType.name, displayOrder: roomType.displayOrder })
    setShowEditRoomTypeModal(true)
  }

  const openAddQuestionModal = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId)
    setSelectedRoomTypeId(roomTypeId)
    setQuestionForm({
      questionText: '',
      questionType: 'text',
      options: [''],
      required: true,
      displayOrder: roomType?.questions.length || 0
    })
    setShowAddQuestionModal(true)
  }

  const openEditQuestionModal = (question: Question) => {
    setEditingQuestion(question)
    const options = question.optionsJson ? JSON.parse(question.optionsJson) : []
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      options: options.length > 0 ? options : [''],
      required: question.required,
      displayOrder: question.displayOrder
    })
    setShowEditQuestionModal(true)
  }

  // Option management
  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
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
              <button 
                onClick={openAddRoomTypeModal}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle pièce
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
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditRoomTypeModal(roomType)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRoomType(roomType.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
                                    {JSON.parse(question.optionsJson).map((option: string, optIndex: number) => (
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
                                <button 
                                  className="p-1 text-gray-400 hover:text-blue-600"
                                  onClick={() => openEditQuestionModal(question)}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <button 
                          onClick={() => openAddQuestionModal(roomType.id)}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center"
                        >
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
                        <button 
                          onClick={() => openAddQuestionModal(roomType.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                        >
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
            <button 
              onClick={openAddRoomTypeModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer votre premier questionnaire
            </button>
          </div>
        )}
      </div>

      {/* Modal: Add Room Type */}
      {showAddRoomTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nouveau type de pièce</h3>
              <button 
                onClick={() => setShowAddRoomTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du type de pièce *
                </label>
                <input
                  type="text"
                  value={roomTypeForm.name}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ex: Salon, Cuisine, Chambre..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={roomTypeForm.displayOrder}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddRoomTypeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddRoomType}
                disabled={actionLoading || !roomTypeForm.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Room Type */}
      {showEditRoomTypeModal && editingRoomType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier le type de pièce</h3>
              <button 
                onClick={() => setShowEditRoomTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du type de pièce *
                </label>
                <input
                  type="text"
                  value={roomTypeForm.name}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={roomTypeForm.displayOrder}
                  onChange={(e) => setRoomTypeForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowEditRoomTypeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button 
                onClick={handleEditRoomType}
                disabled={actionLoading || !roomTypeForm.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQuestionModal && selectedRoomTypeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nouvelle question</h3>
              <button 
                onClick={() => setShowAddQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte de la question *
                </label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Posez votre question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de question
                  </label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm(prev => ({ 
                      ...prev, 
                      questionType: e.target.value as Question['questionType'],
                      options: ['select', 'multiselect', 'radio', 'checkbox'].includes(e.target.value) ? [''] : []
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="text">Texte libre</option>
                    <option value="textarea">Texte long</option>
                    <option value="number">Nombre</option>
                    <option value="select">Choix unique</option>
                    <option value="multiselect">Choix multiple</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Case à cocher</option>
                    <option value="range">Curseur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={questionForm.displayOrder}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={questionForm.required}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                  Réponse obligatoire
                </label>
              </div>

              {['select', 'multiselect', 'radio', 'checkbox'].includes(questionForm.questionType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options de réponse
                  </label>
                  <div className="space-y-2">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder={`Option ${index + 1}`}
                        />
                        {questionForm.options.length > 1 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une option
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddQuestion}
                disabled={actionLoading || !questionForm.questionText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Question */}
      {showEditQuestionModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier la question</h3>
              <button 
                onClick={() => setShowEditQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte de la question *
                </label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de question
                  </label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm(prev => ({ 
                      ...prev, 
                      questionType: e.target.value as Question['questionType'],
                      options: ['select', 'multiselect', 'radio', 'checkbox'].includes(e.target.value) 
                        ? (prev.options.length > 0 ? prev.options : ['']) 
                        : []
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="text">Texte libre</option>
                    <option value="textarea">Texte long</option>
                    <option value="number">Nombre</option>
                    <option value="select">Choix unique</option>
                    <option value="multiselect">Choix multiple</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Case à cocher</option>
                    <option value="range">Curseur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={questionForm.displayOrder}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required-edit"
                  checked={questionForm.required}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="required-edit" className="ml-2 text-sm text-gray-700">
                  Réponse obligatoire
                </label>
              </div>

              {['select', 'multiselect', 'radio', 'checkbox'].includes(questionForm.questionType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options de réponse
                  </label>
                  <div className="space-y-2">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder={`Option ${index + 1}`}
                        />
                        {questionForm.options.length > 1 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une option
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowEditQuestionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button 
                onClick={handleEditQuestion}
                disabled={actionLoading || !questionForm.questionText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}