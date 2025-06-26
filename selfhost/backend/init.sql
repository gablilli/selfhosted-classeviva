
-- Inizializzazione database ClasseViva

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    classeviva_token TEXT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella voti
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade_value DECIMAL(3,2) NOT NULL,
    grade_date DATE NOT NULL,
    description TEXT,
    grade_type VARCHAR(50) DEFAULT 'written',
    teacher VARCHAR(255),
    period VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, subject, grade_date, description)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_grades_user_id ON grades(user_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject);
CREATE INDEX IF NOT EXISTS idx_grades_date ON grades(grade_date);

-- Inserisci dati di esempio
INSERT INTO users (username, first_name, last_name) VALUES ('demo', 'Mario', 'Rossi') ON CONFLICT DO NOTHING;
