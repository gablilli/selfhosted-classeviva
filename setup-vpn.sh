
#!/bin/bash

echo "🚀 Setup ClasseViva VPN Proxy"
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

# Crea la directory per OpenVPN se non exists
mkdir -p ./openvpn-data

echo "📋 Per utilizzare questo setup hai bisogno di:"
echo "1. Un server VPN italiano (puoi usare NordVPN, ExpressVPN, o simili)"
echo "2. File di configurazione .ovpn del tuo provider VPN"
echo ""
echo "🔧 Passi per la configurazione:"
echo "1. Ottieni un file .ovpn dal tuo provider VPN (server italiano)"
echo "2. Copia il file in ./openvpn-data/"
echo "3. Modifica docker-compose.yml con i dettagli del tuo server"
echo "4. Esegui: docker-compose up -d"
echo ""
echo "📡 Una volta avviato, l'API ClasseViva sarà disponibile su:"
echo "   http://localhost:8080/rest/v1/auth/login"
echo "   http://localhost:8080/rest/v1/students/{id}/grades"
echo ""
echo "🔄 Per testare la connessione:"
echo "   curl -X POST http://localhost:8080/rest/v1/auth/login \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"ident\":\"test\",\"pass\":\"test\",\"customerCode\":\"\"}'"
echo ""
echo "⚠️  IMPORTANTE: Questo è solo per uso personale e test!"
echo "    Rispetta i termini di servizio di ClasseViva."

# Crea un esempio di configurazione VPN
cat > ./openvpn-example.conf << 'EOF'
# Esempio configurazione OpenVPN
# Sostituisci con i dati del tuo provider VPN

client
dev tun
proto udp
remote YOUR_VPN_SERVER_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA512
cipher AES-256-CBC
ignore-unknown-option block-outside-dns
block-outside-dns
verb 3

# Inserisci qui i certificati del tuo provider VPN
<ca>
-----BEGIN CERTIFICATE-----
# Il tuo certificato CA qui
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
# Il tuo certificato client qui
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
# La tua chiave privata qui
-----END PRIVATE KEY-----
</key>
EOF

echo ""
echo "📄 Creato file di esempio: ./openvpn-example.conf"
echo "   Modificalo con i dati del tuo provider VPN"
echo ""
echo "🎯 Setup completato! Modifica docker-compose.yml e avvia con:"
echo "   docker-compose up -d"
