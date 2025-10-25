import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer toutes les photos uploadées par les clients
  const clientPhotos = await prisma.inspirationPhoto.findMany({
    where: {
      isClientUpload: true
    },
    include: {
      architect: {
        select: {
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📸 ${clientPhotos.length} photo(s) uploadée(s) par les clients\n`)

  if (clientPhotos.length > 0) {
    clientPhotos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo.title}`)
      console.log(`   URL: ${photo.imageUrl.substring(0, 50)}${photo.imageUrl.length > 50 ? '...' : ''}`)
      console.log(`   Session: ${photo.sessionId || 'Non renseignée'}`)
      console.log(`   Architecte: ${photo.architect.name}`)
      console.log(`   Créée le: ${photo.createdAt}`)
      console.log()
    })
  } else {
    console.log('❌ Aucune photo uploadée par les clients trouvée')
  }

  // Vérifier les sessions récentes
  const recentSessions = await prisma.clientSession.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true
    }
  })

  console.log('\n📋 5 dernières sessions:')
  recentSessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.firstName} ${session.lastName} (${session.email})`)
    console.log(`   ID: ${session.id}`)
    console.log(`   Status: ${session.status}`)
    console.log(`   Créée le: ${session.createdAt}`)
    console.log()
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
