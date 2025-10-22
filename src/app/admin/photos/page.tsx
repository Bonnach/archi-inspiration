"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit,
  Image as ImageIcon,
  Tag,
  Upload
} from 'lucide-react'
import Image from 'next/image'

interface InspirationPhoto {
  id: string
  imageUrl: string
  title: string | null
  description: string | null
  tags: string | null
  active: boolean
  createdAt: string
}

interface RoomType {
  id: string
  name: string
}

export default function AdminPhotosPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [photos, setPhotos] = useState<InspirationPhoto[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPhoto, setNewPhoto] = useState({
    imageUrl: '',
    title: '',
    description: '',
    tags: '',
    roomTypeId: ''
  })

  useEffect(() => {
    const architectData = localStorage.getItem('architect')
    if (!architectData) {
      router.push('/admin/login')
      return
    }

    const parsedArchitect = JSON.parse(architectData)
    setArchitect(parsedArchitect)
    loadData(parsedArchitect.id)
  }, [router])

  const loadData = async (architectId: string) => {
    try {
      // Charger les photos
      const photosResponse = await fetch(`/api/inspiration-photos?architectId=${architectId}`)
      const photosData = await photosResponse.json()

      // Charger les types de pièces
      const roomTypesResponse = await fetch(`/api/room-types?architectId=${architectId}`)
      const roomTypesData = await roomTypesResponse.json()

      if (photosResponse.ok) {
        setPhotos(photosData.photos || [])
      }
      if (roomTypesResponse.ok) {
        setRoomTypes(roomTypesData.roomTypes || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!architect) return

    try {
      const tagsArray = newPhoto.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const response = await fetch('/api/inspiration-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPhoto,
          tags: tagsArray,
          architectId: architect.id,
          roomTypeId: newPhoto.roomTypeId || null
        })
      })

      if (response.ok) {
        setNewPhoto({
          imageUrl: '',
          title: '',
          description: '',
          tags: '',
          roomTypeId: ''
        })
        setShowAddForm(false)
        loadData(architect.id)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    }
  }

  const parseTags = (tagsJson: string | null) => {
    if (!tagsJson) return []
    try {
      return JSON.parse(tagsJson)
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
                  Photos d'inspiration
                </h1>
                <p className="text-sm text-gray-500">{photos.length} photos</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une photo
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Photo Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter une nouvelle photo
            </h3>
            
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image *
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    value={newPhoto.imageUrl}
                    onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de pièce
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newPhoto.roomTypeId}
                    onChange={(e) => setNewPhoto({ ...newPhoto, roomTypeId: e.target.value })}
                  >
                    <option value="">Toutes les pièces</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de l'inspiration"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description de l'inspiration"
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="moderne, lumineux, élégant"
                  value={newPhoto.tags}
                  onChange={(e) => setNewPhoto({ ...newPhoto, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewPhoto({
                      imageUrl: '',
                      title: '',
                      description: '',
                      tags: '',
                      roomTypeId: ''
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title || 'Inspiration'}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-4">
                  {photo.title && (
                    <h4 className="font-medium text-gray-900 mb-1">
                      {photo.title}
                    </h4>
                  )}
                  
                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {photo.description}
                    </p>
                  )}
                  
                  {photo.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {parseTags(photo.tags).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      photo.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {photo.active ? 'Active' : 'Inactive'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune photo d'inspiration
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter quelques photos pour inspirer vos clients
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre première photo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}