import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const architect = await prisma.architect.findUnique({
    where: { email: 'demo@architecte.fr' }
  })

  if (!architect) {
    console.error('❌ Architecte non trouvé')
    return
  }

  // Récupérer les types de pièces actuels
  const salon = await prisma.roomType.findFirst({ 
    where: { name: 'Salon', architectId: architect.id } 
  })
  const cuisine = await prisma.roomType.findFirst({ 
    where: { name: 'Cuisine ouverte', architectId: architect.id } 
  })
  const chambre = await prisma.roomType.findFirst({ 
    where: { name: 'Chambre principale', architectId: architect.id } 
  })
  const salleBain = await prisma.roomType.findFirst({ 
    where: { name: 'Salle de bains principale', architectId: architect.id } 
  })
  const bureau = await prisma.roomType.findFirst({ 
    where: { name: 'Bureau principal', architectId: architect.id } 
  })

  console.log('📂 IDs des types de pièces actuels:')
  console.log('  Salon:', salon?.id)
  console.log('  Cuisine:', cuisine?.id)
  console.log('  Chambre:', chambre?.id)
  console.log('  Salle de bain:', salleBain?.id)
  console.log('  Bureau:', bureau?.id)

  // Récupérer toutes les photos
  const photos = await prisma.inspirationPhoto.findMany({
    where: { architectId: architect.id }
  })

  console.log(`\n📸 ${photos.length} photos trouvées`)

  // Vérifier combien ont des roomTypeIds valides
  let validCount = 0
  let invalidCount = 0
  const validRoomTypeIds = new Set([
    salon?.id, cuisine?.id, chambre?.id, salleBain?.id, bureau?.id
  ].filter(Boolean))

  for (const photo of photos) {
    if (photo.roomTypeIds) {
      try {
        const ids = JSON.parse(photo.roomTypeIds)
        const hasValidId = ids.some((id: string) => validRoomTypeIds.has(id))
        if (hasValidId) {
          validCount++
        } else {
          invalidCount++
          console.log(`❌ Photo invalide: ${photo.title} (IDs: ${photo.roomTypeIds})`)
        }
      } catch {
        invalidCount++
      }
    } else {
      invalidCount++
      console.log(`⚠️  Photo sans roomTypeIds: ${photo.title}`)
    }
  }

  console.log(`\n✅ Photos valides: ${validCount}`)
  console.log(`❌ Photos invalides: ${invalidCount}`)

  if (invalidCount > 0) {
    console.log('\n🔧 Correction nécessaire...')
    
    // Supprimer toutes les photos et les réajouter avec les bons IDs
    await prisma.inspirationPhoto.deleteMany({
      where: { architectId: architect.id }
    })
    console.log('  ✓ Photos supprimées')

    // Réajouter les photos
    const photosToAdd = [
      { title: 'Salon moderne minimaliste', description: 'Salon épuré avec grandes baies vitrées', roomTypeId: salon?.id, tags: ['moderne', 'minimaliste', 'lumineux', 'épuré'], url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800' },
      { title: 'Salon cosy scandinave', description: 'Ambiance chaleureuse avec bois clair', roomTypeId: salon?.id, tags: ['scandinave', 'cosy', 'bois', 'chaleureux'], url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800' },
      { title: 'Salon industriel loft', description: 'Style loft avec briques apparentes', roomTypeId: salon?.id, tags: ['industriel', 'loft', 'briques', 'urbain'], url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800' },
      
      { title: 'Cuisine moderne avec îlot', description: 'Cuisine contemporaine avec îlot central', roomTypeId: cuisine?.id, tags: ['moderne', 'îlot', 'contemporain', 'fonctionnel'], url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800' },
      { title: 'Cuisine blanche épurée', description: 'Design minimaliste tout en blanc', roomTypeId: cuisine?.id, tags: ['blanc', 'minimaliste', 'épuré', 'lumineux'], url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800' },
      { title: 'Cuisine bois et noir', description: 'Mélange chaleureux bois naturel et noir mat', roomTypeId: cuisine?.id, tags: ['bois', 'noir', 'contraste', 'naturel'], url: 'https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=800' },
      
      { title: 'Chambre zen minimaliste', description: 'Ambiance apaisante tons neutres', roomTypeId: chambre?.id, tags: ['zen', 'minimaliste', 'apaisant', 'neutre'], url: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800' },
      { title: 'Chambre cocooning', description: 'Chambre chaleureuse avec textiles doux', roomTypeId: chambre?.id, tags: ['cocooning', 'chaleureux', 'confortable', 'doux'], url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800' },
      { title: 'Chambre scandinave', description: 'Style nordique épuré et lumineux', roomTypeId: chambre?.id, tags: ['scandinave', 'nordique', 'lumineux', 'bois'], url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800' },
      
      { title: 'Salle de bain spa', description: 'Ambiance spa avec baignoire îlot', roomTypeId: salleBain?.id, tags: ['spa', 'détente', 'baignoire', 'luxe'], url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800' },
      { title: 'Salle de bain moderne', description: 'Design contemporain avec douche italienne', roomTypeId: salleBain?.id, tags: ['moderne', 'douche', 'contemporain', 'épuré'], url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800' },
      { title: 'Salle de bain naturelle', description: 'Matériaux naturels et tons chauds', roomTypeId: salleBain?.id, tags: ['naturel', 'bois', 'pierre', 'chaleureux'], url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800' },
      
      { title: 'Bureau minimaliste', description: 'Espace de travail épuré et fonctionnel', roomTypeId: bureau?.id, tags: ['minimaliste', 'fonctionnel', 'épuré', 'moderne'], url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800' },
      { title: 'Bureau lumineux', description: 'Bureau avec grande fenêtre et lumière naturelle', roomTypeId: bureau?.id, tags: ['lumineux', 'fenêtre', 'naturel', 'inspirant'], url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800' },
      { title: 'Bureau cosy bibliothèque', description: 'Bureau chaleureux avec bibliothèque intégrée', roomTypeId: bureau?.id, tags: ['bibliothèque', 'cosy', 'livres', 'chaleureux'], url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800' }
    ]

    for (const photo of photosToAdd) {
      if (photo.roomTypeId) {
        await prisma.inspirationPhoto.create({
          data: {
            architectId: architect.id,
            imageUrl: photo.url,
            title: photo.title,
            description: photo.description,
            roomTypeIds: JSON.stringify([photo.roomTypeId]),
            tags: JSON.stringify(photo.tags),
            active: true,
            isClientUpload: false
          }
        })
      }
    }
    
    console.log(`  ✓ ${photosToAdd.length} photos réajoutées avec les bons IDs`)
  }

  console.log('\n✨ Vérification terminée !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
