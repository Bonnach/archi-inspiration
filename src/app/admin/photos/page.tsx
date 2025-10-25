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
  Upload,
  Home,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'

interface InspirationPhoto {
  id: string
  imageUrl: string
  title: string | null
  description: string | null
  tags: string | null
  roomTypeIds: string | null
  active: boolean
  createdAt: string
}

interface RoomType {
  id: string
  name: string
  displayOrder: number
  parentId: string | null
  children?: RoomType[]
}

export default function AdminPhotosPage() {
  const router = useRouter()
  const [architect, setArchitect] = useState<any>(null)
  const [photos, setPhotos] = useState<InspirationPhoto[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<InspirationPhoto | null>(null)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())
  const [newPhoto, setNewPhoto] = useState({
    imageUrl: '',
    title: '',
    description: '',
    tags: '',
    roomTypeIds: [] as string[]
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [editPhoto, setEditPhoto] = useState({
    imageUrl: '',
    title: '',
    description: '',
    tags: '',
    roomTypeIds: [] as string[]
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

      // Charger les types de pièces avec hiérarchie
      const roomTypesResponse = await fetch(`/api/room-types?architectId=${architectId}&includeChildren=true`)
      const roomTypesData = await roomTypesResponse.json()

      if (photosResponse.ok) {
        setPhotos(photosData.photos || [])
      }
      if (roomTypesResponse.ok) {
        // Ne garder que les catégories principales
        const categories = roomTypesData.roomTypes.filter((rt: RoomType) => rt.parentId === null)
        setRoomTypes(categories)
        // Expand all by default
        setExpandedCategories(new Set(categories.map((c: RoomType) => c.id)))
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setSelectedFiles(prev => [...prev, ...imageFiles])
    
    // Créer les URLs de prévisualisation
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!architect || selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      const tagsArray = newPhoto.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      // Upload chaque fichier
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        
        // Upload le fichier
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload du fichier')
        }
        
        const uploadData = await uploadResponse.json()
        
        // Créer l'entrée de photo avec l'URL uploadée
        const response = await fetch('/api/inspiration-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl: uploadData.url,
            title: newPhoto.title || file.name.replace(/\.[^/.]+$/, ''),
            description: newPhoto.description,
            tags: tagsArray,
            architectId: architect.id,
            roomTypeIds: newPhoto.roomTypeIds
          })
        })

        if (!response.ok) {
          const data = await response.json()
          console.error('Erreur pour', file.name, ':', data.error)
        }
      }

      // Réinitialiser le formulaire
      setNewPhoto({
        imageUrl: '',
        title: '',
        description: '',
        tags: '',
        roomTypeIds: []
      })
      setSelectedFiles([])
      setPreviewUrls([])
      setShowAddForm(false)
      loadData(architect.id)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue lors de l\'upload')
    } finally {
      setIsUploading(false)
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

  const parseRoomTypeIds = (roomTypeIdsJson: string | null): string[] => {
    if (!roomTypeIdsJson) return []
    try {
      return JSON.parse(roomTypeIdsJson)
    } catch {
      return []
    }
  }

  // Helper pour trouver un roomType dans la hiérarchie
  const findRoomType = (roomId: string): RoomType | undefined => {
    for (const category of roomTypes) {
      if (category.id === roomId) return category
      if (category.children) {
        const found = category.children.find(child => child.id === roomId)
        if (found) return found
      }
    }
    return undefined
  }

  const handleEditClick = (photo: InspirationPhoto) => {
    setEditingPhoto(photo)
    const tags = parseTags(photo.tags)
    const roomIds = parseRoomTypeIds(photo.roomTypeIds)
    
    setEditPhoto({
      imageUrl: photo.imageUrl,
      title: photo.title || '',
      description: photo.description || '',
      tags: tags.join(', '),
      roomTypeIds: roomIds
    })
    setShowEditForm(true)
  }

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!architect || !editingPhoto) return

    try {
      const tagsArray = editPhoto.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const response = await fetch(`/api/inspiration-photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: editPhoto.imageUrl,
          title: editPhoto.title,
          description: editPhoto.description,
          tags: tagsArray,
          roomTypeIds: editPhoto.roomTypeIds
        })
      })

      if (response.ok) {
        setShowEditForm(false)
        setEditingPhoto(null)
        setEditPhoto({
          imageUrl: '',
          title: '',
          description: '',
          tags: '',
          roomTypeIds: []
        })
        loadData(architect.id)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!architect) return
    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return

    try {
      const response = await fetch(`/api/inspiration-photos/${photoId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData(architect.id)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
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

            {/* Removed global add button - photos are now added per room type */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Photo Form */}
        {showAddForm && selectedRoomTypeId && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ajouter une photo pour {findRoomType(selectedRoomTypeId)?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cette photo sera automatiquement associée à ce type de pièce
                </p>
              </div>
            </div>
            
            <form onSubmit={handleAddPhoto} className="space-y-4">
              {/* Upload Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images * (Sélectionnez ou glissez-déposez plusieurs images)
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                    const files = Array.from(e.dataTransfer.files)
                    handleFiles(files)
                  }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Cliquez pour sélectionner ou glissez-déposez vos images</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF jusqu'à 10MB chacune</p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu ({selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {selectedFiles[index].name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre (optionnel, laissez vide pour utiliser le nom du fichier)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Titre commun pour toutes les photos"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel, sera appliquée à toutes les photos)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  rows={2}
                  placeholder="Description commune"
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules, sera appliqué à toutes les photos)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
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
                    setSelectedFiles([])
                    setPreviewUrls([])
                    setNewPhoto({
                      imageUrl: '',
                      title: '',
                      description: '',
                      tags: '',
                      roomTypeIds: []
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upload en cours...
                    </>
                  ) : (
                    `Ajouter ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Photo Form */}
        {showEditForm && editingPhoto && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifier la photo
            </h3>
            
            <form onSubmit={handleUpdatePhoto} className="space-y-4">
              {/* Aperçu de l'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu
                </label>
                <div className="relative h-48 w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={editPhoto.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Afficher les types de pièces associées (lecture seule) */}
              {editPhoto.roomTypeIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Associée à
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {editPhoto.roomTypeIds.map((roomId: string) => {
                      const roomType = findRoomType(roomId)
                      return roomType ? (
                        <span
                          key={roomId}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-700 font-medium"
                        >
                          {roomType.name}
                        </span>
                      ) : null
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pour changer l'association, supprimez et réajoutez la photo dans le type de pièce souhaité
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Titre de l'inspiration"
                  value={editPhoto.title}
                  onChange={(e) => setEditPhoto({ ...editPhoto, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  rows={3}
                  placeholder="Description de l'inspiration"
                  value={editPhoto.description}
                  onChange={(e) => setEditPhoto({ ...editPhoto, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="moderne, lumineux, élégant"
                  value={editPhoto.tags}
                  onChange={(e) => setEditPhoto({ ...editPhoto, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingPhoto(null)
                    setEditPhoto({
                      imageUrl: '',
                      title: '',
                      description: '',
                      tags: '',
                      roomTypeIds: []
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Photos organized by Room Type */}
        {roomTypes.length > 0 ? (
          <div className="space-y-6">
            {roomTypes
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow">
                {/* Catégorie Header */}
                <div 
                  className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 cursor-pointer"
                  onClick={() => {
                    const newExpanded = new Set(expandedCategories)
                    if (newExpanded.has(category.id)) {
                      newExpanded.delete(category.id)
                    } else {
                      newExpanded.add(category.id)
                    }
                    setExpandedCategories(newExpanded)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-6 w-6 text-blue-600 mr-3" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-blue-600 mr-3" />
                      )}
                      <Home className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Room Types dans la catégorie */}
                {expandedCategories.has(category.id) && category.children && (
                  <div className="p-4">
                    {category.children
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((roomType) => {
                        const roomPhotos = photos.filter(photo => {
                          const roomIds = parseRoomTypeIds(photo.roomTypeIds)
                          return roomIds.includes(roomType.id)
                        })
                        
                        return (
                          <div key={roomType.id} className="border border-gray-200 rounded-lg mb-4">
                            <div 
                              className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                const newExpanded = new Set(expandedRooms)
                                if (newExpanded.has(roomType.id)) {
                                  newExpanded.delete(roomType.id)
                                } else {
                                  newExpanded.add(roomType.id)
                                }
                                setExpandedRooms(newExpanded)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  {expandedRooms.has(roomType.id) ? (
                                    <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                                  )}
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {roomType.name}
                                  </h3>
                                  <span className="ml-3 text-sm text-gray-600">
                                    ({roomPhotos.length} photo{roomPhotos.length > 1 ? 's' : ''})
                                  </span>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedRoomTypeId(roomType.id)
                                    setNewPhoto({
                                      ...newPhoto,
                                      roomTypeIds: [roomType.id]
                                    })
                                    setShowAddForm(true)
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center text-sm"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Ajouter
                                </button>
                              </div>
                            </div>

                            {expandedRooms.has(roomType.id) && (
                              <div className="p-4">
                                {roomPhotos.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {roomPhotos.map((photo) => (
                                      <div key={photo.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="relative h-48">
                                          <Image
                                            src={photo.imageUrl}
                                            alt={photo.title || 'Inspiration'}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        
                                        <div className="p-3">
                                          {photo.title && (
                                            <h4 className="font-medium text-gray-900 mb-1 text-sm">
                                              {photo.title}
                                            </h4>
                                          )}
                                          
                                          {photo.description && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                              {photo.description}
                                            </p>
                                          )}
                                          
                                          {photo.tags && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                              {parseTags(photo.tags).slice(0, 3).map((tag: string, index: number) => (
                                                <span
                                                  key={index}
                                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700"
                                                >
                                                  {tag}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          
                                          <div className="flex justify-between items-center mt-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                              photo.active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {photo.active ? 'Active' : 'Inactive'}
                                            </span>
                                            
                                            <div className="flex space-x-1">
                                              <button 
                                                onClick={() => handleEditClick(photo)}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </button>
                                              <button 
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm">Aucune photo pour {roomType.name}</p>
                                    <button
                                      onClick={() => {
                                        setSelectedRoomTypeId(roomType.id)
                                        setNewPhoto({
                                          ...newPhoto,
                                          roomTypeIds: [roomType.id]
                                        })
                                        setShowAddForm(true)
                                      }}
                                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center mx-auto text-sm"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Ajouter la première photo
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun type de pièce configuré
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par configurer vos types de pièces dans le gestionnaire de questionnaires
            </p>
          </div>
        )}
      </div>
    </div>
  )
}