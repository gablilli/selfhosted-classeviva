
#!/bin/bash

echo "🚀 Setup ClasseViva Self-Hosted"
echo "================================"

# Controlla se Docker è installato
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trovato. Installalo prima di continuare."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose non trovato. Installalo prima di continuare."
    exit 1
fi

echo "✅ Docker trovato"

# Crea le directory necessarie
mkdir -p selfhost/frontend/src/{pages,components,contexts}
mkdir -p selfhost/backend
mkdir -p selfhost/nginx

echo "📋 Configurazione completata!"
echo ""
echo "🔧 Per avviare l'applicazione:"
echo "1. cd selfhost"
echo "2. docker-compose up -d"
echo ""
echo "📡 L'app sarà disponibile su:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   Database: localhost:5432"
echo ""
echo "🔑 Credenziali demo:"
echo "   Username: demo"
echo "   Password: qualunque"
echo ""
echo "⚠️  Per uso in produzione:"
echo "   - Cambia le password nel docker-compose.yml"
echo "   - Configura SSL con certbot"
echo "   - Aggiorna JWT_SECRET nel backend"

chmod +x setup.sh
