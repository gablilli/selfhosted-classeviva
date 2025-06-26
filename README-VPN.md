
# ClasseViva VPN Proxy Setup

Questo setup Docker risolve il problema del geoblocking di ClasseViva creando un proxy VPN attraverso un server italiano.

## 🚀 Setup Rapido

### 1. Prerequisiti
- Docker e Docker Compose installati
- Account VPN con server italiani (NordVPN, ExpressVPN, ecc.)

### 2. Configurazione

1. **Ottieni configurazione VPN**:
   - Scarica il file `.ovpn` del tuo provider VPN (server italiano)
   - Copialo in `./openvpn-data/client.ovpn`

2. **Avvia i servizi**:
   ```bash
   chmod +x setup-vpn.sh
   ./setup-vpn.sh
   docker-compose up -d
   ```

3. **Verifica connessione**:
   ```bash
   curl -X POST http://localhost:8080/rest/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"ident":"test","pass":"test","customerCode":""}'
   ```

### 3. Integrazione con Supabase Edge Functions

Modifica le Edge Functions per usare il proxy locale:

```typescript
// Sostituisci gli URL nelle Edge Functions
const API_BASE = 'http://localhost:8080'; // invece di web.spaggiari.eu
```

## 🔧 Configurazione VPN Providers

### NordVPN
1. Vai su [NordVPN Downloads](https://nordvpn.com/ovpn/)
2. Scarica la configurazione per un server italiano
3. Rinomina il file in `client.ovpn`

### ExpressVPN
1. Accedi al dashboard ExpressVPN
2. Vai su "Set up ExpressVPN" → "Manual Config"
3. Scarica il file .ovpn per un server italiano

### Surfshark
1. Accedi a Surfshark
2. Vai su "Manual setup" → "OpenVPN"
3. Scarica la configurazione per l'Italia

## 🐳 Comandi Docker Utili

```bash
# Avvia i servizi
docker-compose up -d

# Controlla i log
docker-compose logs -f

# Ferma i servizi
docker-compose down

# Riavvia solo il proxy
docker-compose restart classeviva-proxy

# Controlla lo stato della VPN
docker exec classeviva-vpn ip route
```

## 🧪 Test dell'API

```bash
# Test login
curl -X POST http://localhost:8080/rest/v1/auth/login \
     -H 'Content-Type: application/json' \
     -H 'Z-Dev-Apikey: +zorro+' \
     -d '{"ident":"USERNAME","pass":"PASSWORD","customerCode":""}'

# Test con il token ottenuto
curl -H 'Z-Auth-Token: YOUR_TOKEN' \
     -H 'Z-Dev-Apikey: +zorro+' \
     http://localhost:8080/rest/v1/students/STUDENT_ID/grades
```

## ⚠️ Note Importanti

1. **Uso Personale**: Questo setup è solo per uso personale e test
2. **Termini di Servizio**: Rispetta i termini di servizio di ClasseViva
3. **Sicurezza**: Non condividere le tue credenziali VPN
4. **Performance**: La connessione attraverso VPN può essere più lenta

## 🔍 Troubleshooting

### Errore di connessione VPN
```bash
# Controlla i log VPN
docker logs classeviva-vpn

# Verifica la configurazione
docker exec classeviva-vpn cat /etc/openvpn/client.ovpn
```

### Proxy non raggiungibile
```bash
# Controlla che nginx sia in esecuzione
docker logs classeviva-proxy

# Testa la connessione interna
docker exec classeviva-proxy curl -I https://web.spaggiari.eu
```

### IP non italiano
```bash
# Controlla l'IP pubblico del container
docker exec classeviva-vpn curl ifconfig.me
```

## 🎯 Prossimi Passi

Una volta che il proxy VPN funziona:

1. Modifica le Edge Functions per usare `http://localhost:8080`
2. Testa l'login con credenziali reali
3. Verifica che i voti vengano scaricati correttamente
4. Considera di deployare il proxy su un server dedicato per uso continuativo
