import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer l'architecte demo@architecte.fr (celui qui a les room types)
  const architectWithRooms = await prisma.architect.findUnique({
    where: { email: 'demo@architecte.fr' }
  })

  if (!architectWithRooms) {
    console.error('❌ Architecte avec types de pièces non trouvé')
    return
  }

  // Récupérer les types de pièces
  const salon = await prisma.roomType.findFirst({ 
    where: { name: 'Salon', architectId: architectWithRooms.id } 
  })
  const cuisine = await prisma.roomType.findFirst({ 
    where: { name: 'Cuisine ouverte', architectId: architectWithRooms.id } 
  })
  const chambre = await prisma.roomType.findFirst({ 
    where: { name: 'Chambre principale', architectId: architectWithRooms.id } 
  })
  const salleBain = await prisma.roomType.findFirst({ 
    where: { name: 'Salle de bains principale', architectId: architectWithRooms.id } 
  })
  const bureau = await prisma.roomType.findFirst({ 
    where: { name: 'Bureau principal', architectId: architectWithRooms.id } 
  })

  console.log('📂 Types de pièces trouvés:')
  console.log('  - Salon:', salon?.id)
  console.log('  - Cuisine:', cuisine?.id)
  console.log('  - Chambre:', chambre?.id)
  console.log('  - Salle de bain:', salleBain?.id)
  console.log('  - Bureau:', bureau?.id)

  // Récupérer toutes les photos de l'architecte demo@architecte.com
  const photosToUpdate = await prisma.inspirationPhoto.findMany({
    where: { 
      architectId: { not: architectWithRooms.id },
      isClientUpload: false
    }
  })

  console.log(`\n📸 ${photosToUpdate.length} photos à mettre à jour`)

  // Mettre à jour chaque photo avec le bon architectId et roomTypeIds
  let updated = 0
  for (const photo of photosToUpdate) {
    let roomTypeIds: string[] = []

    // Déterminer le type de pièce selon le titre
    if (photo.title?.toLowerCase().includes('salon')) {
      roomTypeIds = salon ? [salon.id] : []
    } else if (photo.title?.toLowerCase().includes('cuisine')) {
      roomTypeIds = cuisine ? [cuisine.id] : []
    } else if (photo.title?.toLowerCase().includes('chambre')) {
      roomTypeIds = chambre ? [chambre.id] : []
    } else if (photo.title?.toLowerCase().includes('salle de bain')) {
      roomTypeIds = salleBain ? [salleBain.id] : []
    } else if (photo.title?.toLowerCase().includes('bureau')) {
      roomTypeIds = bureau ? [bureau.id] : []
    }

    if (roomTypeIds.length > 0) {
      await prisma.inspirationPhoto.update({
        where: { id: photo.id },
        data: {
          architectId: architectWithRooms.id,
          roomTypeIds: JSON.stringify(roomTypeIds)
        }
      })
      console.log(`✅ ${photo.title} → ${roomTypeIds.length} type(s) de pièce`)
      updated++
    }
  }

  console.log(`\n✨ ${updated} photos mises à jour !`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
