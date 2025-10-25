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

  console.log('📧 Architecte:', architect.email)
  console.log('🆔 ID:', architect.id)

  // Compter les types de pièces
  const roomTypes = await prisma.roomType.findMany({
    where: { architectId: architect.id },
    include: {
      children: true
    }
  })

  const categories = roomTypes.filter(rt => rt.parentId === null)
  const rooms = roomTypes.filter(rt => rt.parentId !== null)

  console.log('\n📂 Types de pièces:')
  console.log(`  - ${categories.length} catégories`)
  console.log(`  - ${rooms.length} pièces`)
  console.log(`  - ${roomTypes.length} total`)

  if (categories.length > 0) {
    console.log('\n📋 Catégories:')
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.children.length} enfants)`)
    })
  }

  // Compter les photos
  const photos = await prisma.inspirationPhoto.findMany({
    where: { architectId: architect.id }
  })

  console.log(`\n📸 Photos: ${photos.length}`)
  
  if (photos.length > 0) {
    console.log('\nExemple de photo:')
    const sample = photos[0]
    console.log('  ID:', sample.id)
    console.log('  Title:', sample.title)
    console.log('  RoomTypeIds:', sample.roomTypeIds)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
