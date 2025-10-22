import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Créer un architecte de démonstration
  const demoArchitect = await prisma.architect.create({
    data: {
      id: 'demo-architect-id',
      email: 'demo@architecte.com',
      password: await hashPassword('demo123'),
      name: 'Architecte Démo',
      company: 'Studio Démo'
    }
  })

  console.log('✅ Architecte démo créé:', demoArchitect.name)

  // Créer les types de pièces
  const roomTypes = [
    { name: 'Salon', displayOrder: 1 },
    { name: 'Cuisine', displayOrder: 2 },
    { name: 'Salle de bain', displayOrder: 3 },
    { name: 'Chambre', displayOrder: 4 }
  ]

  for (const roomType of roomTypes) {
    const createdRoomType = await prisma.roomType.create({
      data: {
        ...roomType,
        architectId: demoArchitect.id
      }
    })

    console.log(`✅ Type de pièce créé: ${createdRoomType.name}`)

    // Créer les questions pour chaque type de pièce
    const questions = getQuestionsForRoomType(roomType.name)
    
    for (let i = 0; i < questions.length; i++) {
      await prisma.question.create({
        data: {
          ...questions[i],
          roomTypeId: createdRoomType.id,
          displayOrder: i + 1
        }
      })
    }

    console.log(`✅ ${questions.length} questions créées pour ${roomType.name}`)
  }

  // Créer quelques photos d'inspiration d'exemple
  const samplePhotos = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      title: 'Salon moderne minimaliste',
      description: 'Un salon épuré aux lignes modernes',
      tags: JSON.stringify(['moderne', 'minimaliste', 'lumineux'])
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      title: 'Cuisine ouverte contemporaine',
      description: 'Cuisine avec îlot central et finitions haut de gamme',
      tags: JSON.stringify(['contemporain', 'îlot', 'ouvert'])
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop',
      title: 'Salle de bain zen',
      description: 'Salle de bain aux inspirations naturelles',
      tags: JSON.stringify(['zen', 'naturel', 'relaxant'])
    }
  ]

  for (const photo of samplePhotos) {
    await prisma.inspirationPhoto.create({
      data: {
        ...photo,
        architectId: demoArchitect.id
      }
    })
  }

  console.log(`✅ ${samplePhotos.length} photos d'inspiration créées`)
}

function getQuestionsForRoomType(roomTypeName: string) {
  switch (roomTypeName) {
    case 'Salon':
      return [
        {
          questionText: 'Quel style préférez-vous pour votre salon ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Contemporain', 'Classique', 'Industriel', 'Scandinave', 'Bohème']),
          required: true
        },
        {
          questionText: 'Comment souhaitez-vous disposer votre salon ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Canapé face TV', 'Salon de conversation', 'Configuration modulaire', 'Espace ouvert']),
          required: true
        },
        {
          questionText: 'Quels matériaux vous attirent le plus ?',
          questionType: 'multiple',
          optionsJson: JSON.stringify(['Bois', 'Métal', 'Tissus naturels', 'Cuir', 'Pierre', 'Verre']),
          required: false
        }
      ]

    case 'Cuisine':
      return [
        {
          questionText: 'Quelle configuration de cuisine préférez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Linéaire', 'En L', 'En U', 'Avec îlot central', 'Ouverte sur le salon']),
          required: true
        },
        {
          questionText: 'Quel style de façades vous plaît ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Moderne laquée', 'Bois naturel', 'Industrielle', 'Classique', 'Minimaliste']),
          required: true
        },
        {
          questionText: 'Quel niveau d\'équipement souhaitez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Électroménager standard', 'Haut de gamme', 'Encastrable intégral', 'Professionnel']),
          required: true
        }
      ]

    case 'Salle de bain':
      return [
        {
          questionText: 'Quel type de douche préférez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Douche à l\'italienne', 'Cabine de douche', 'Baignoire-douche', 'Douche et baignoire séparées']),
          required: true
        },
        {
          questionText: 'Combien de vasques souhaitez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Une vasque simple', 'Double vasques', 'Selon l\'espace disponible']),
          required: true
        },
        {
          questionText: 'Quel style d\'ambiance recherchez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Moderne', 'Zen et naturel', 'Classique', 'Industriel', 'Luxe']),
          required: true
        }
      ]

    case 'Chambre':
      return [
        {
          questionText: 'Quelle ambiance souhaitez-vous pour votre chambre ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Cocooning', 'Minimaliste', 'Romantique', 'Moderne', 'Bohème']),
          required: true
        },
        {
          questionText: 'Quel type de rangements préférez-vous ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Dressing séparé', 'Placards intégrés', 'Meubles libres', 'Rangements sous le lit']),
          required: true
        },
        {
          questionText: 'Quel éclairage privilégiez-vous ?',
          questionType: 'multiple',
          optionsJson: JSON.stringify(['Éclairage tamisé', 'Lumière naturelle', 'Éclairage fonctionnel', 'Lampes d\'ambiance']),
          required: false
        }
      ]

    default:
      return []
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🎉 Base de données initialisée avec succès!')
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    await prisma.$disconnect()
    process.exit(1)
  })