import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer l'architecte démo
  const architect = await prisma.architect.findUnique({
    where: { email: 'demo@architecte.fr' }
  })

  if (!architect) {
    console.error('❌ Architecte démo non trouvé.')
    console.log('Recherche des architectes disponibles...')
    const architects = await prisma.architect.findMany()
    console.log('Architectes trouvés:', architects.map(a => ({ id: a.id, email: a.email })))
    process.exit(1)
  }

  console.log(`📍 Utilisation de l'architecte: ${architect.email} (${architect.id})`)

  // Récupérer quelques types de pièces
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

  const photos = [
    // Salons
    {
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
      title: 'Salon moderne minimaliste',
      description: 'Salon épuré avec grandes baies vitrées',
      roomTypeIds: salon ? [salon.id] : [],
      tags: ['moderne', 'minimaliste', 'lumineux', 'épuré']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
      title: 'Salon cosy scandinave',
      description: 'Ambiance chaleureuse avec bois clair',
      roomTypeIds: salon ? [salon.id] : [],
      tags: ['scandinave', 'cosy', 'bois', 'chaleureux']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      title: 'Salon industriel loft',
      description: 'Style loft avec briques apparentes',
      roomTypeIds: salon ? [salon.id] : [],
      tags: ['industriel', 'loft', 'briques', 'urbain']
    },

    // Cuisines
    {
      imageUrl: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
      title: 'Cuisine moderne avec îlot',
      description: 'Cuisine contemporaine avec îlot central',
      roomTypeIds: cuisine ? [cuisine.id] : [],
      tags: ['moderne', 'îlot', 'contemporain', 'fonctionnel']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800',
      title: 'Cuisine blanche épurée',
      description: 'Design minimaliste tout en blanc',
      roomTypeIds: cuisine ? [cuisine.id] : [],
      tags: ['blanc', 'minimaliste', 'épuré', 'lumineux']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=800',
      title: 'Cuisine bois et noir',
      description: 'Mélange chaleureux bois naturel et noir mat',
      roomTypeIds: cuisine ? [cuisine.id] : [],
      tags: ['bois', 'noir', 'contraste', 'naturel']
    },

    // Chambres
    {
      imageUrl: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800',
      title: 'Chambre zen minimaliste',
      description: 'Ambiance apaisante tons neutres',
      roomTypeIds: chambre ? [chambre.id] : [],
      tags: ['zen', 'minimaliste', 'apaisant', 'neutre']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
      title: 'Chambre cocooning',
      description: 'Chambre chaleureuse avec textiles doux',
      roomTypeIds: chambre ? [chambre.id] : [],
      tags: ['cocooning', 'chaleureux', 'confortable', 'doux']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
      title: 'Chambre scandinave',
      description: 'Style nordique épuré et lumineux',
      roomTypeIds: chambre ? [chambre.id] : [],
      tags: ['scandinave', 'nordique', 'lumineux', 'bois']
    },

    // Salles de bain
    {
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
      title: 'Salle de bain spa',
      description: 'Ambiance spa avec baignoire îlot',
      roomTypeIds: salleBain ? [salleBain.id] : [],
      tags: ['spa', 'détente', 'baignoire', 'luxe']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
      title: 'Salle de bain moderne',
      description: 'Design contemporain avec douche italienne',
      roomTypeIds: salleBain ? [salleBain.id] : [],
      tags: ['moderne', 'douche', 'contemporain', 'épuré']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
      title: 'Salle de bain naturelle',
      description: 'Matériaux naturels et tons chauds',
      roomTypeIds: salleBain ? [salleBain.id] : [],
      tags: ['naturel', 'bois', 'pierre', 'chaleureux']
    },

    // Bureaux
    {
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
      title: 'Bureau minimaliste',
      description: 'Espace de travail épuré et fonctionnel',
      roomTypeIds: bureau ? [bureau.id] : [],
      tags: ['minimaliste', 'fonctionnel', 'épuré', 'moderne']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800',
      title: 'Bureau lumineux',
      description: 'Bureau avec grande fenêtre et lumière naturelle',
      roomTypeIds: bureau ? [bureau.id] : [],
      tags: ['lumineux', 'fenêtre', 'naturel', 'inspirant']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      title: 'Bureau cosy bibliothèque',
      description: 'Bureau chaleureux avec bibliothèque intégrée',
      roomTypeIds: bureau ? [bureau.id] : [],
      tags: ['bibliothèque', 'cosy', 'livres', 'chaleureux']
    }
  ]

  console.log('📸 Ajout des photos d\'inspiration...\n')

  for (const photo of photos) {
    await prisma.inspirationPhoto.create({
      data: {
        architectId: architect.id,
        imageUrl: photo.imageUrl,
        title: photo.title,
        description: photo.description,
        roomTypeIds: JSON.stringify(photo.roomTypeIds),
        tags: JSON.stringify(photo.tags),
        active: true,
        isClientUpload: false
      }
    })
    console.log(`✅ ${photo.title}`)
  }

  console.log(`\n✨ ${photos.length} photos ajoutées avec succès !`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
