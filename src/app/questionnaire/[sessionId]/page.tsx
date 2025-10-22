"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, Home } from 'lucide-react'

interface Question {
  id: string
  questionText: string
  questionType: string
  optionsJson: string | null
  required: boolean
  displayOrder: number
}

interface RoomType {
  id: string
  name: string
  displayOrder: number
  questions: Question[]
}

interface QuestionnairePageProps {
  params: {
    sessionId: string
  }
}

export default function QuestionnairePage({ params }: QuestionnairePageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)
  
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadQuestionnaire()
  }, [])

  const loadQuestionnaire = async () => {
    try {
      // Pour la démo, nous utiliserons l'architecte démo
      const response = await fetch(`/api/room-types?architectId=demo-architect-id`)
      const data = await response.json()
      
      if (response.ok) {
        setRoomTypes(data.roomTypes)
      } else {
        console.error('Erreur:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRoom = roomTypes[currentRoomIndex]
  const currentQuestion = currentRoom?.questions[currentQuestionIndex]
  const totalQuestions = roomTypes.reduce((total, room) => total + room.questions.length, 0)
  const currentQuestionNumber = roomTypes.slice(0, currentRoomIndex).reduce((total, room) => total + room.questions.length, 0) + currentQuestionIndex + 1

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = async () => {
    const isLastQuestionInRoom = currentQuestionIndex === currentRoom.questions.length - 1
    const isLastRoom = currentRoomIndex === roomTypes.length - 1

    // Sauvegarder la réponse
    if (currentQuestion && answers[currentQuestion.id]) {
      await saveAnswer(currentQuestion.id, answers[currentQuestion.id])
    }

    if (isLastQuestionInRoom) {
      if (isLastRoom) {
        // Fin du questionnaire, aller vers les inspirations
        router.push(`/inspirations/${sessionId}`)
        return
      } else {
        // Passer à la pièce suivante
        setCurrentRoomIndex(prev => prev + 1)
        setCurrentQuestionIndex(0)
      }
    } else {
      // Question suivante dans la même pièce
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) {
      if (currentRoomIndex > 0) {
        setCurrentRoomIndex(prev => prev - 1)
        setCurrentQuestionIndex(roomTypes[currentRoomIndex - 1].questions.length - 1)
      }
    } else {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const saveAnswer = async (questionId: string, answerValue: string) => {
    try {
      await fetch('/api/client-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          questionId,
          answerValue
        })
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const options = currentQuestion.optionsJson ? JSON.parse(currentQuestion.optionsJson) : []

    switch (currentQuestion.questionType) {
      case 'select':
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  answers[currentQuestion.id] === option
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'multiple':
        return (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const selectedOptions = answers[currentQuestion.id] ? JSON.parse(answers[currentQuestion.id] || '[]') : []
              const isSelected = selectedOptions.includes(option)
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    let newSelected = [...selectedOptions]
                    if (isSelected) {
                      newSelected = newSelected.filter(item => item !== option)
                    } else {
                      newSelected.push(option)
                    }
                    handleAnswer(currentQuestion.id, JSON.stringify(newSelected))
                  }}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors flex items-center ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  {option}
                </button>
              )
            })}
          </div>
        )

      default:
        return (
          <input
            type="text"
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="Votre réponse..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!currentRoom || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Questionnaire terminé!</h1>
          <button
            onClick={() => router.push(`/inspirations/${sessionId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          >
            Voir les inspirations
          </button>
        </div>
      </div>
    )
  }

  const canProceed = currentQuestion.required ? answers[currentQuestion.id] : true

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-indigo-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Questionnaire</h1>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600">
              Question {currentQuestionNumber} sur {totalQuestions} · {currentRoom.name}
            </p>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.questionText}
            </h2>

            {renderQuestion()}

            {currentQuestion.required && !answers[currentQuestion.id] && (
              <p className="text-sm text-gray-500 mt-4">
                * Cette question est obligatoire
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentRoomIndex === 0 && currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg"
            >
              Suivant
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}