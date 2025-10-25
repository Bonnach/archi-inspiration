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

  console.log('🗑️  Suppression des types de pièces existants...')
  
  // Supprimer toutes les questions liées
  await prisma.question.deleteMany({
    where: {
      roomType: {
        architectId: architect.id
      }
    }
  })
  
  // Supprimer tous les roomTypes de cet architecte
  await prisma.roomType.deleteMany({
    where: { architectId: architect.id }
  })

  console.log('✅ Types de pièces supprimés')
  console.log('\n🌱 Création de la structure complète...\n')

  // Créer les catégories avec TOUTES les pièces
  const categories = [
    { 
      name: '🏡 Espaces de vie', 
      children: [
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
      name: '🛏️ Espaces nuit', 
      children: [
        'Chambre principale',
        'Suite parentale (avec salle d\'eau / dressing)',
        'Chambre d\'amis',
        'Chambre d\'enfant',
        'Chambre d\'adolescent',
        'Dortoir (gîte / maison secondaire)',
        'Mezzanine / coin nuit'
      ] 
    },
    { 
      name: '🛁 Espaces d\'eau', 
      children: [
        'Salle de bains principale',
        'Salle d\'eau',
        'Douche d\'appoint',
        'WC indépendant',
        'Buanderie / lingerie',
        'Espace bien-être (sauna, hammam, jacuzzi)'
      ] 
    },
    { 
      name: '🧑‍💼 Espaces de travail / techniques', 
      children: [
        'Bureau principal',
        'Bureau d\'appoint',
        'Atelier (créatif, bricolage, peinture…)',
        'Studio musique / son / vidéo',
        'Salle informatique / gaming room',
        'Local technique (chaufferie, PAC, ballon, etc.)'
      ] 
    },
    { 
      name: '🍷 Espaces de stockage et annexes', 
      children: [
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
      name: '🚗 Espaces extérieurs', 
      children: [
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
        'Abri à vélos / local technique extérieur'
      ] 
    },
    { 
      name: '🏘️ Espaces spécifiques', 
      children: [
        'Studio indépendant (location, ado, télétravail)',
        'Chambre d\'hôtes / gîte',
        'Atelier professionnel / boutique',
        'Salle de sport / fitness',
        'Salle de danse / yoga',
        'Salle de musique',
        'Salle de réception / banquet',
        'Galerie d\'art / exposition',
        'Orangerie / serre',
        'Chapelle / espace spirituel',
        'Chambre de service',
        'Logement du personnel'
      ] 
    },
    { 
      name: '➕ Pièce libre', 
      children: [
        'Autre (à préciser)'
      ] 
    }
  ]

  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const cat = categories[catIndex]
    const category = await prisma.roomType.create({
      data: {
        name: cat.name,
        displayOrder: catIndex,
        architectId: architect.id,
        parentId: null
      }
    })

    for (let i = 0; i < cat.children.length; i++) {
      await prisma.roomType.create({
        data: {
          name: cat.children[i],
          displayOrder: i,
          architectId: architect.id,
          parentId: category.id
        }
      })
    }
    console.log(`✅ ${cat.name} : ${cat.children.length} pièce(s)`)
  }

  console.log('\n📝 Ajout des questions exemple...')

  // Ajouter des questions pour certaines pièces
  const salon = await prisma.roomType.findFirst({ 
    where: { name: 'Salon', architectId: architect.id } 
  })
  if (salon) {
    await prisma.question.createMany({
      data: [
        { 
          roomTypeId: salon.id, 
          questionText: 'Quelle ambiance souhaitez-vous pour votre salon ?', 
          questionType: 'select', 
          optionsJson: JSON.stringify(['Cosy et chaleureux', 'Moderne et épuré', 'Classique et élégant', 'Industriel', 'Scandinave']), 
          required: true, 
          displayOrder: 0 
        },
        { 
          roomTypeId: salon.id, 
          questionText: 'Combien de personnes doivent pouvoir s\'asseoir confortablement ?', 
          questionType: 'number', 
          required: false, 
          displayOrder: 1 
        }
      ]
    })
    console.log('  ✓ Questions pour Salon')
  }

  const cuisine = await prisma.roomType.findFirst({ 
    where: { name: 'Cuisine ouverte', architectId: architect.id } 
  })
  if (cuisine) {
    await prisma.question.createMany({
      data: [
        { 
          roomTypeId: cuisine.id, 
          questionText: 'Quel type d\'aménagement préférez-vous ?', 
          questionType: 'select', 
          optionsJson: JSON.stringify(['Linéaire', 'En L', 'En U', 'Avec îlot central', 'En parallèle']), 
          required: true, 
          displayOrder: 0 
        }
      ]
    })
    console.log('  ✓ Questions pour Cuisine')
  }

  const chambre = await prisma.roomType.findFirst({ 
    where: { name: 'Chambre principale', architectId: architect.id } 
  })
  if (chambre) {
    await prisma.question.createMany({
      data: [
        { 
          roomTypeId: chambre.id, 
          questionText: 'Ambiance recherchée', 
          questionType: 'select', 
          optionsJson: JSON.stringify(['Zen et apaisante', 'Lumineuse', 'Cocooning', 'Minimaliste', 'Romantique']), 
          required: true, 
          displayOrder: 0 
        }
      ]
    })
    console.log('  ✓ Questions pour Chambre')
  }

  // Compter le total
  const totalCategories = categories.length
  const totalRooms = categories.reduce((sum, cat) => sum + cat.children.length, 0)

  console.log('\n✨ Structure complète créée !')
  console.log(`   ${totalCategories} catégories`)
  console.log(`   ${totalRooms} types de pièces`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
