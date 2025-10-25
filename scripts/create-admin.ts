import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@architecte.fr'
  const password = 'demo123'
  
  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 12)
  
  // Vérifier si l'architecte existe
  const existing = await prisma.architect.findUnique({ where: { email } })
  
  if (existing) {
    // Mettre à jour le mot de passe
    const architect = await prisma.architect.update({
      where: { email },
      data: {
        password: hashedPassword
      }
    })
    console.log('✅ Mot de passe mis à jour pour:', architect.email)
  } else {
    // Créer l'architecte
    const architect = await prisma.architect.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Architecte Démo',
        company: 'Cabinet d\'Architecture Démo'
      }
    })
    console.log('✅ Compte créé:', architect.email)
  }
  
  console.log('\n📧 Email:', email)
  console.log('🔑 Mot de passe:', password)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
