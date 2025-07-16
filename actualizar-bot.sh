#!/bin/bash

echo "🔄 Subiendo archivos al VPS..."

rsync -avz --exclude-from='.scpignore' ./ botuser@134.122.121.237:/home/botuser/whatsapp-bot-essen

echo "✅ Archivos subidos."

echo "🚀 Reiniciando bot en el VPS..."

ssh botuser@134.122.121.237 'pm2 restart bot-essen'

echo "✅ Bot reiniciado correctamente."
