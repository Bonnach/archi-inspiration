import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Créer un architecte de démonstration
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const demoArchitect = await prisma.architect.create({
    data: {
      id: 'demo-architect-id',
      email: 'demo@architecte.com',
      password: hashedPassword,
      name: 'Architecte Démo',
      company: 'Cabinet Démo'
    }
  })

  console.log('✅ Architecte démo créé:', demoArchitect.name)

  // Structure hiérarchique complète des pièces
  const roomStructure = [
    {
      category: '🏡 Espaces de vie',
      order: 1,
      rooms: [
        'Entrée / hall',
        'Salon',
        'Séjour',
        'Salle à manger',
        'Cuisine ouverte',
        'Cuisine fermée',
        'Coin repas',
        'Véranda / jardin d\'hiver',
        'Pièce de réception',
        'Salle de jeux / salle TV',
        'Bibliothèque',
        'Home cinéma'
      ]
    },
    {
      category: '🛏️ Espaces nuit',
      order: 2,
      rooms: [
        'Chambre principale',
        'Suite parentale',
        'Chambre d\'amis',
        'Chambre d\'enfant',
        'Chambre d\'adolescent',
        'Dortoir',
        'Mezzanine / coin nuit'
      ]
    },
    {
      category: '🛁 Espaces d\'eau',
      order: 3,
      rooms: [
        'Salle de bains principale',
        'Salle d\'eau',
        'Douche d\'appoint',
        'WC indépendant',
        'Buanderie / lingerie',
        'Espace bien-être'
      ]
    },
    {
      category: '🧑‍💼 Espaces de travail / techniques',
      order: 4,
      rooms: [
        'Bureau principal',
        'Bureau d\'appoint',
        'Atelier',
        'Studio musique / son / vidéo',
        'Salle informatique / gaming room',
        'Local technique'
      ]
    },
    {
      category: '🍷 Espaces de stockage et annexes',
      order: 5,
      rooms: [
        'Cellier / garde-manger',
        'Arrière-cuisine',
        'Cave à vin',
        'Cave alimentaire',
        'Grenier / combles',
        'Dressing indépendant',
        'Placards sous escalier',
        'Réserve / débarras',
        'Local jardin / abri'
      ]
    },
    {
      category: '🚗 Espaces extérieurs',
      order: 6,
      rooms: [
        'Terrasse',
        'Balcon',
        'Patio / cour intérieure',
        'Jardin',
        'Cuisine d\'extérieur',
        'Abri de jardin',
        'Piscine',
        'Pool house',
        'Spa extérieur',
        'Carport',
        'Garage',
        'Abri à vélos'
      ]
    },
    {
      category: '🏘️ Espaces spécifiques',
      order: 7,
      rooms: [
        'Studio indépendant',
        'Chambre d\'hôtes / gîte',
        'Atelier professionnel / boutique',
        'Salle de sport / fitness',
        'Salle de danse / yoga',
        'Salle de musique',
        'Salle de réception / banquet',
        'Galerie d\'art',
        'Orangerie / serre',
        'Chapelle / espace spirituel',
        'Chambre de service',
        'Logement du personnel'
      ]
    }
  ]

  // Créer les catégories et leurs pièces
  for (const category of roomStructure) {
    // Créer la catégorie principale (parent)
    const parentRoom = await prisma.roomType.create({
      data: {
        name: category.category,
        displayOrder: category.order,
        architectId: demoArchitect.id,
        parentId: null, // Catégorie principale
        active: true
      }
    })

    console.log(`✅ Catégorie créée: ${category.category}`)

    // Créer les sous-pièces
    for (let i = 0; i < category.rooms.length; i++) {
      await prisma.roomType.create({
        data: {
          name: category.rooms[i],
          displayOrder: i,
          architectId: demoArchitect.id,
          parentId: parentRoom.id, // Lier à la catégorie
          active: true
        }
      })
    }

    console.log(`   → ${category.rooms.length} pièces créées`)
  }

  // Créer quelques questions d'exemple pour le Salon
  const salon = await prisma.roomType.findFirst({
    where: {
      name: 'Salon',
      architectId: demoArchitect.id
    }
  })

  if (salon) {
    await prisma.question.createMany({
      data: [
        {
          roomTypeId: salon.id,
          questionText: 'Quel style préférez-vous pour votre salon ?',
          questionType: 'select',
          optionsJson: JSON.stringify(['Contemporain', 'Classique', 'Industriel', 'Scandinave', 'Bohème']),
          required: true,
          displayOrder: 0,
          active: true
        },
        {
          roomTypeId: salon.id,
          questionText: 'Quelle ambiance souhaitez-vous créer ?',
          questionType: 'multiple',
          optionsJson: JSON.stringify(['Chaleureuse', 'Lumineuse', 'Cosy', 'Épurée', 'Conviviale']),
          required: false,
          displayOrder: 1,
          active: true
        },
        {
          roomTypeId: salon.id,
          questionText: 'Avez-vous des contraintes particulières ?',
          questionType: 'text',
          optionsJson: null,
          required: false,
          displayOrder: 2,
          active: true
        }
      ]
    })

    console.log('✅ Questions d\'exemple créées pour le Salon')
  }

  // Créer quelques photos d'inspiration d'exemple
  await prisma.inspirationPhoto.createMany({
    data: [
      {
        architectId: demoArchitect.id,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        title: 'Salon contemporain lumineux',
        description: 'Un espace ouvert avec des tons neutres',
        tags: JSON.stringify(['contemporain', 'lumineux', 'neutre']),
        roomTypeIds: salon ? JSON.stringify([salon.id]) : null,
        active: true
      },
      {
        architectId: demoArchitect.id,
        imageUrl: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800',
        title: 'Cuisine moderne ouverte',
        description: 'Cuisine avec îlot central et finitions épurées',
        tags: JSON.stringify(['moderne', 'épuré', 'fonctionnel']),
        roomTypeIds: null, // Pas de pièce spécifique
        active: true
      },
      {
        architectId: demoArchitect.id,
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
        title: 'Chambre cosy scandinave',
        description: 'Ambiance chaleureuse avec matériaux naturels',
        tags: JSON.stringify(['scandinave', 'cosy', 'naturel']),
        roomTypeIds: null,
        active: true
      }
    ]
  })

  console.log('✅ 3 photos d\'inspiration créées')

  console.log('\n🎉 Base de données initialisée avec succès!')
  console.log(`📊 ${roomStructure.reduce((acc, cat) => acc + cat.rooms.length, 0)} pièces créées dans ${roomStructure.length} catégories`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
