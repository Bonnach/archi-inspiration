"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, MessageCircle, ArrowRight, Image as ImageIcon, Check } from 'lucide-react'
import Image from 'next/image'

interface Annotation {
  x: number
  y: number
  comment: string
}

interface UploadedPhoto {
  file: File
  preview: string
  title: string
  annotations: Annotation[]
}

interface PersonalPhotosPageProps {
  params: {
    sessionId: string
  }
}

export default function PersonalPhotosPage({ params }: PersonalPhotosPageProps) {
  const router = useRouter()
  const { sessionId } = React.use(params)
  
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null)
  const [currentAnnotations, setCurrentAnnotations] = useState<Annotation[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedPhotos(prev => [...prev, {
            file,
            preview: e.target?.result as string,
            title: file.name.replace(/\.[^/.]+$/, ''), // Nom sans extension
            annotations: []
          }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
    if (currentPhotoIndex === index) {
      setCurrentPhotoIndex(null)
      setCurrentAnnotations([])
    }
  }

  const handleStartAnnotating = (index: number) => {
    setCurrentPhotoIndex(index)
    setCurrentAnnotations(uploadedPhotos[index].annotations)
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentPhotoIndex === null) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const comment = prompt("Qu'aimez-vous dans cette zone ?")
    if (comment) {
      setCurrentAnnotations(prev => [...prev, { x, y, comment }])
    }
  }

  const handleSaveAnnotations = () => {
    if (currentPhotoIndex === null) return
    
    setUploadedPhotos(prev => prev.map((photo, i) => 
      i === currentPhotoIndex 
        ? { ...photo, annotations: currentAnnotations }
        : photo
    ))
    setCurrentPhotoIndex(null)
    setCurrentAnnotations([])
  }

  const handleUploadAll = async () => {
    if (uploadedPhotos.length === 0) {
      router.push(`/results/${sessionId}`)
      return
    }

    setIsUploading(true)

    try {
      // Pour chaque photo, l'uploader puis créer l'entrée en base
      for (const photo of uploadedPhotos) {
        // 1. Upload du fichier
        const formData = new FormData()
        formData.append('file', photo.file)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadResponse.ok) {
          throw new Error(`Erreur upload ${photo.title}`)
        }
        
        const uploadData = await uploadResponse.json()
        
        // 2. Créer l'entrée en base avec l'URL uploadée
        const createResponse = await fetch('/api/inspiration-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            architectId: 'demo-architect-id',
            sessionId: sessionId,
            imageUrl: uploadData.url,
            title: photo.title,
            isClientUpload: true,
            roomTypeIds: [] // Photos client = pas de pièce spécifique
          })
        })
        
        if (!createResponse.ok) {
          throw new Error(`Erreur création photo ${photo.title}`)
        }

        // TODO: Si des annotations, les sauvegarder
      }

      router.push(`/results/${sessionId}`)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload des photos')
    } finally {
      setIsUploading(false)
    }
  }

  const currentPhoto = currentPhotoIndex !== null ? uploadedPhotos[currentPhotoIndex] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ImageIcon className="h-10 w-10 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Vos photos personnelles
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Importez vos propres photos d'inspiration et annotez ce que vous aimez
            </p>
          </div>

          {currentPhotoIndex === null ? (
            <>
              {/* Upload Zone */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Cliquez pour importer vos photos
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG jusqu'à 10MB • Plusieurs fichiers acceptés
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photos Grid */}
              {uploadedPhotos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Photos importées ({uploadedPhotos.length})
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-40 rounded-lg overflow-hidden">
                          <Image
                            src={photo.preview}
                            alt={photo.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <button
                              onClick={() => handleRemovePhoto(index)}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-gray-700 truncate flex-1">
                            {photo.title}
                          </p>
                          {photo.annotations.length > 0 && (
                            <div className="flex items-center text-xs text-indigo-600 ml-2">
                              <Check className="h-3 w-3 mr-1" />
                              {photo.annotations.length}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartAnnotating(index)}
                          className="mt-2 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Annoter
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/results/${sessionId}`)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    >
                      Passer
                    </button>
                    <button
                      onClick={handleUploadAll}
                      disabled={isUploading}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          Enregistrer et continuer
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {uploadedPhotos.length === 0 && (
                <div className="text-center">
                  <button
                    onClick={() => router.push(`/results/${sessionId}`)}
                    className="text-gray-600 hover:text-gray-900 underline"
                  >
                    Passer cette étape
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Annotation View */
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Annotez: {currentPhoto?.title}
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentPhotoIndex(null)
                      setCurrentAnnotations([])
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div 
                className="relative h-96 cursor-crosshair"
                onClick={handleImageClick}
              >
                <Image
                  src={currentPhoto!.preview}
                  alt={currentPhoto!.title}
                  fill
                  className="object-contain"
                />
                
                {currentAnnotations.map((annotation, index) => (
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

              <div className="p-6">
                <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-indigo-700 mb-3">
                    Cliquez sur l'image pour marquer les éléments que vous appréciez
                  </p>
                  
                  {currentAnnotations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-indigo-900">
                        Vos annotations ({currentAnnotations.length}) :
                      </p>
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
                </div>

                <button
                  onClick={handleSaveAnnotations}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
                >
                  Enregistrer les annotations
                  <Check className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
