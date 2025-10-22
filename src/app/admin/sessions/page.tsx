"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  Trash2
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

export default function AdminSessionsPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [sessions, setSessions] = useState<ClientSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const architectData = localStorage.getItem('architect')
    if (!architectData) {
      router.push('/admin/login')
      return
    }

    const parsedArchitect = JSON.parse(architectData)
    setArchitect(parsedArchitect)
    loadSessions(parsedArchitect.id)
  }, [router])

  const loadSessions = async (architectId: string) => {
    try {
      const response = await fetch(`/api/client-sessions?architectId=${architectId}`)
      const data = await response.json()

      if (response.ok) {
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSession = async (sessionId: string, clientName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la session de ${clientName} ? Cette action est irréversible.`)) {
      return
    }

    setActionLoading(sessionId)
    try {
      const response = await fetch(`/api/client-sessions/${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Recharger la liste des sessions
        if (architect) {
          await loadSessions(architect.id)
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
    }
  }

  const downloadPDF = async (sessionId: string, clientName: string) => {
    setActionLoading(sessionId)
    try {
      // Ouvrir la page de rapport dans un nouvel onglet
      const reportUrl = `/api/client-sessions/${sessionId}/pdf`
      window.open(reportUrl, '_blank')
      
      // Alternative: téléchargement direct
      // const response = await fetch(reportUrl)
      // const htmlContent = await response.text()
      // const blob = new Blob([htmlContent], { type: 'text/html' })
      // const url = window.URL.createObjectURL(blob)
      // const a = document.createElement('a')
      // a.href = url
      // a.download = `rapport-${clientName.replace(' ', '-')}.html`
      // document.body.appendChild(a)
      // a.click()
      // window.URL.revokeObjectURL(url)
      // document.body.removeChild(a)
      
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du rapport')
    } finally {
      setActionLoading(null)
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

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
                  Sessions clients
                </h1>
                <p className="text-sm text-gray-500">{sessions.length} sessions au total</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Toutes les sessions</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminées</option>
                  <option value="abandoned">Abandonnées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''} trouvée{filteredSessions.length > 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créée le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {session.firstName} {session.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {session.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'abandoned'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.status === 'completed' 
                            ? 'Terminée' 
                            : session.status === 'abandoned' 
                            ? 'Abandonnée' 
                            : 'En cours'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(session.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => router.push(`/admin/sessions/${session.id}`)}
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => downloadPDF(session.id, `${session.firstName} ${session.lastName}`)}
                            disabled={actionLoading === session.id}
                            className="text-green-600 hover:text-green-700 flex items-center disabled:opacity-50"
                            title="Télécharger le rapport PDF"
                          >
                            {actionLoading === session.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => deleteSession(session.id, `${session.firstName} ${session.lastName}`)}
                            disabled={actionLoading === session.id}
                            className="text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
                            title="Supprimer la session"
                          >
                            {actionLoading === session.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune session trouvée
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les sessions de vos clients apparaîtront ici'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}