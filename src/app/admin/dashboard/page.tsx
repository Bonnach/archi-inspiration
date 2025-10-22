"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FileText, 
  Image, 
  Settings, 
  LogOut, 
  Plus,
  Building,
  Calendar,
  Eye,
  TrendingUp
} from 'lucide-react'

interface ClientSession {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  createdAt: string
  completedAt: string | null
}

interface Stats {
  totalSessions: number
  completedSessions: number
  totalQuestions: number
  totalPhotos: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [sessions, setSessions] = useState<ClientSession[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    completedSessions: 0,
    totalQuestions: 0,
    totalPhotos: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification
    const architectData = localStorage.getItem('architect')
    if (!architectData) {
      router.push('/admin/login')
      return
    }

    const parsedArchitect = JSON.parse(architectData)
    setArchitect(parsedArchitect)
    loadDashboardData(parsedArchitect.id)
  }, [router])

  const loadDashboardData = async (architectId: string) => {
    try {
      // Charger les sessions
      const sessionsResponse = await fetch(`/api/client-sessions?architectId=${architectId}`)
      const sessionsData = await sessionsResponse.json()

      // Charger les statistiques
      const roomTypesResponse = await fetch(`/api/room-types?architectId=${architectId}`)
      const roomTypesData = await roomTypesResponse.json()

      const photosResponse = await fetch(`/api/inspiration-photos?architectId=${architectId}`)
      const photosData = await photosResponse.json()

      if (sessionsResponse.ok) {
        setSessions(sessionsData.sessions || [])
        
        // Calculer les statistiques
        const totalSessions = sessionsData.sessions?.length || 0
        const completedSessions = sessionsData.sessions?.filter((s: any) => s.status === 'completed').length || 0
        const totalQuestions = roomTypesData.roomTypes?.reduce((acc: number, rt: any) => acc + rt.questions.length, 0) || 0
        const totalPhotos = photosData.photos?.length || 0

        setStats({
          totalSessions,
          completedSessions,
          totalQuestions,
          totalPhotos
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('architect')
    router.push('/admin/login')
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
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {architect.company || 'Mon Studio'}
                </h1>
                <p className="text-sm text-gray-500">{architect.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complétées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Image className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Photos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/questionnaires')}
            className="bg-white rounded-lg shadow p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gérer les questionnaires
            </h3>
            <p className="text-gray-600">
              Modifier les questions et les types de pièces
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/photos')}
            className="bg-white rounded-lg shadow p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <Image className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Photos d'inspiration
            </h3>
            <p className="text-gray-600">
              Ajouter et organiser les photos d'ambiance
            </p>
          </button>

          <button
            onClick={() => router.push('/admin/sessions')}
            className="bg-white rounded-lg shadow p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sessions clients
            </h3>
            <p className="text-gray-600">
              Consulter les réponses et préférences
            </p>
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sessions récentes</h3>
          </div>
          <div className="p-6">
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.firstName} {session.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{session.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Créée le {formatDate(session.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status === 'completed' ? 'Terminée' : 'En cours'}
                      </span>
                      <button
                        onClick={() => router.push(`/admin/sessions/${session.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune session pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}