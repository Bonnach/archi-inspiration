#!/bin/bash

# Créer le dossier de backups s'il n'existe pas
mkdir -p backups

# Nom du fichier avec timestamp
BACKUP_FILE="backups/backup-$(date +%Y%m%d-%H%M%S).db"

# Copier la base de données
cp prisma/dev.db "$BACKUP_FILE"

echo "✅ Sauvegarde créée : $BACKUP_FILE"
ls -lh "$BACKUP_FILE"

# Garder seulement les 10 dernières sauvegardes
cd backups
ls -t backup-*.db | tail -n +11 | xargs -r rm
echo "🧹 Anciennes sauvegardes nettoyées (max 10)"
