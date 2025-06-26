
# ClasseViva Self-Hosted

Un'applicazione web completa per gestire i dati di ClasseViva in modo self-hosted con Docker.

## 🚀 Caratteristiche

- **Backend Node.js/Express** con API REST
- **Database PostgreSQL** per salvare i dati localmente
- **Frontend React/TypeScript** con interfaccia moderna
- **Nginx** come reverse proxy
- **Docker Compose** per l'orchestrazione
- **Autenticazione JWT** per la sicurezza
- **Fallback a dati mock** se ClasseViva non è raggiungibile

## 📋 Prerequisiti

- Docker e Docker Compose installati
- Porte 80, 3001, 5432 libere

## 🔧 Installazione

1. **Clona o scarica i file**:
   ```bash
   # Se hai git
   git clone <repository-url>
   cd selfhost
   
   # Oppure scarica e estrai i file nella cartella selfhost/
   ```

2. **Avvia con Docker Compose**:
   ```bash
   cd selfhost
   docker-compose up -d
   ```

3. **Aspetta che tutti i servizi si avviino** (circa 2-3 minuti)

4. **Apri il browser** e vai su `http://localhost`

## 🔑 Credenziali Demo

Per testare l'app senza ClasseViva:
- Username: `demo`
- Password: `qualunque cosa`

## 🌐 URL dell'applicazione

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Database**: localhost:5432

## 📂 Struttura del progetto

```
selfhost/
├── docker-compose.yml          # Orchestrazione servizi
├── backend/                    # API Node.js
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js              # Server principale
│   └── init.sql               # Schema database
├── frontend/                   # App React
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── pages/             # Login, Dashboard, ecc.
│       ├── components/        # Componenti riusabili
│       └── contexts/          # Context per auth
└── nginx/                     # Configurazione proxy
    └── nginx.conf
```

## 🔒 Sicurezza per produzione

Prima di usare in produzione:

1. **Cambia le password**:
   ```yaml
   # In docker-compose.yml
   environment:
     POSTGRES_PASSWORD: tua_password_sicura
     JWT_SECRET: tua_chiave_jwt_sicura
   ```

2. **Configura SSL**:
   ```bash
   # Aggiungi certificati SSL
   # Modifica nginx.conf per HTTPS
   ```

3. **Firewall e rete**:
   ```bash
   # Chiudi porte non necessarie
   # Configura reverse proxy esterno se necessario
   ```

## 🐳 Comandi utili

```bash
# Avvia tutti i servizi
docker-compose up -d

# Vedi i log
docker-compose logs -f

# Ferma tutto
docker-compose down

# Ricostruisci immagini
docker-compose build --no-cache

# Accedi al database
docker exec -it classeviva-db psql -U classeviva_user -d classeviva

# Vedi stato servizi
docker-compose ps
```

## 🔧 Sviluppo

Per sviluppare in locale:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 API Endpoints

- `POST /api/auth/login` - Login utente
- `POST /api/grades` - Ottieni voti
- `GET /api/health` - Health check

## 🐛 Troubleshooting

**Errore di connessione al database**:
```bash
docker-compose down
docker volume rm selfhost_postgres_data
docker-compose up -d
```

**Port già in uso**:
```bash
# Cambia le porte in docker-compose.yml
ports:
  - "8080:80"  # invece di "80:80"
```

**Permessi file**:
```bash
chmod +x setup.sh
sudo chown -R $USER:$USER selfhost/
```

## 📞 Supporto

Per problemi o domande:
1. Controlla i log: `docker-compose logs`
2. Verifica che tutte le porte siano libere
3. Assicurati che Docker abbia abbastanza memoria (almeno 2GB)

## 📄 Licenza

Questo progetto è per uso personale ed educativo. Rispetta i termini di servizio di ClasseViva.
