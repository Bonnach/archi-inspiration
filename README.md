# Archi Inspiration 🏠✨

Une plateforme web dédiée aux architectes et leurs clients pour découvrir leurs préférences architecturales à travers des questionnaires interactifs et des inspirations visuelles.

## 🚀 Fonctionnalités

### Pour les clients :
- ✅ **Questionnaire personnalisé** : Répondez à des questions sur vos préférences par type de pièce
- ✅ **Interface "Tinder-like"** : Swipez les photos d'inspiration (j'aime/j'aime pas)
- ✅ **Annotations interactives** : Cliquez sur les photos pour annoter ce que vous aimez
- ✅ **Profil architectural** : Obtenez un résumé de vos préférences

### Pour les architectes :
- ✅ **Dashboard complet** : Vue d'ensemble des sessions clients et statistiques
- ✅ **Gestion des questionnaires** : Créez et modifiez les questions par type de pièce
- ✅ **Bibliothèque d'inspirations** : Gérez les photos d'ambiance avec tags et descriptions
- ✅ **Analyse des clients** : Consultez les réponses détaillées et préférences visuelles

## 🛠️ Technologies utilisées

- **Framework** : Next.js 15 avec TypeScript
- **Base de données** : SQLite avec Prisma ORM
- **Styling** : Tailwind CSS
- **Authentification** : bcryptjs pour le hachage des mots de passe
- **Icônes** : Lucide React
- **Images** : Unsplash (pour les exemples)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn

## ⚡ Installation

1. **Cloner le projet**
   ```bash
   git clone <repo-url>
   cd archi-inspiration
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   - Interface client : http://localhost:3000
   - Interface admin : http://localhost:3000/admin/login

## 🔑 Comptes de démonstration

### Architecte
- **Email** : demo@architecte.com
- **Mot de passe** : demo123

## 📊 Structure de la base de données

### Modèles principaux :

- **Architect** : Données des architectes (nom, entreprise, mot de passe)
- **ClientSession** : Sessions clients avec informations de contact
- **RoomType** : Types de pièces (salon, cuisine, salle de bain, etc.)
- **Question** : Questions du questionnaire avec options et types
- **ClientAnswer** : Réponses des clients aux questions
- **InspirationPhoto** : Photos d'inspiration avec métadonnées
- **PhotoInteraction** : Actions des clients sur les photos (like/dislike + annotations)

## 🎨 Types de questions supportés

- **select** : Choix unique parmi plusieurs options
- **multiple** : Choix multiple (checkboxes)
- **text** : Réponse libre en texte

## 📱 Workflow utilisateur

1. **Accueil** : Le client saisit ses informations (prénom, nom, email)
2. **Questionnaire** : Questions organisées par type de pièce avec barre de progression
3. **Inspirations** : Interface de swipe avec possibilité d'annoter les photos aimées
4. **Résultats** : Profil architectural avec réponses groupées et photos préférées

## 🏗️ API Endpoints

### Architectes
- `POST /api/architects/register` : Inscription
- `POST /api/architects/login` : Connexion

### Sessions clients  
- `POST /api/client-sessions` : Créer une session
- `GET /api/client-sessions?architectId=xxx` : Lister les sessions

### Questionnaire
- `GET /api/room-types?architectId=xxx` : Types de pièces et questions
- `POST /api/client-answers` : Sauvegarder une réponse

### Inspirations
- `GET /api/inspiration-photos?architectId=xxx` : Photos d'inspiration
- `POST /api/photo-interactions` : Sauvegarder like/dislike + annotations

## 🎯 Améliorations possibles

- [ ] **Upload d'images** : Interface pour uploader ses propres photos
- [ ] **Filtres avancés** : Filtrer les inspirations par tags/style
- [ ] **Notifications** : Alertes email pour les nouvelles sessions
- [ ] **Export PDF** : Génération de rapports clients
- [ ] **Multi-langues** : Support français/anglais
- [ ] **Responsive mobile** : Optimisation tactile pour les swipes
- [ ] **Authentification avancée** : JWT tokens, sessions persistantes
- [ ] **Analytics** : Statistiques d'usage et préférences tendances

---

**Développé avec ❤️ pour faciliter la collaboration architecte-client**
