# 🚀 Guida al Deployment su Supabase

Questa guida ti spiega come pushare le modifiche al database su Supabase.

## 📋 Prerequisiti

1. **Account Supabase**: Assicurati di avere un progetto Supabase attivo
2. **Credenziali**: Hai bisogno delle credenziali del progetto

## 🔧 Metodo 1: SQL Editor (Raccomandato per iniziare)

### Passo 1: Accedi a Supabase Dashboard

1. Vai su [supabase.com](https://supabase.com)
2. Accedi al tuo account
3. Seleziona il tuo progetto

### Passo 2: Esegui le Migration

1. **Vai alla sezione SQL Editor**
   - Nel menu laterale, clicca su **SQL Editor**

2. **Esegui la prima migration (Database Schema)**
   ```sql
   -- Copia tutto il contenuto del file:
   -- supabase/migrations/001_create_travel_schema.sql
   -- Incolla nel SQL Editor e clicca "Run"
   ```

3. **Esegui la seconda migration (Storage)**
   ```sql
   -- Copia tutto il contenuto del file:
   -- supabase/migrations/002_setup_storage.sql
   -- Incolla nel SQL Editor e clicca "Run"
   ```

4. **Esegui la terza migration (Storage Policies)**
   ```sql
   -- Copia tutto il contenuto del file:
   -- supabase/migrations/003_storage_policies.sql
   -- Incolla nel SQL Editor e clicca "Run"
   ```

5. **Esegui la quarta migration (Itinerary Invites)**
   ```sql
   -- Copia tutto il contenuto del file:
   -- supabase/migrations/004_create_itinerary_invites.sql
   -- Incolla nel SQL Editor e clicca "Run"
   ```

6. **Esegui la quinta migration (Storage Function)**
   ```sql
   -- Copia tutto il contenuto del file:
   -- supabase/migrations/005_add_storage_function.sql
   -- Incolla nel SQL Editor e clicca "Run"
   ```

### Passo 3: Verifica il Setup

Esegui queste query per verificare che tutto sia stato creato correttamente:

```sql
-- Verifica le tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'itineraries', 'stops', 'activities', 'activity_media', 
  'tags', 'activity_tags', 'accommodations', 'notes', 'attachments', 'itinerary_invites'
);

-- Verifica le policy RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verifica il bucket storage
SELECT * FROM storage.buckets WHERE id = 'attachments';
```

## 🛠️ Metodo 2: Supabase CLI (Per sviluppatori avanzati)

### Passo 1: Installa Supabase CLI

```bash
# Con npm
npm install -g supabase

# Con pnpm
pnpm add -g supabase

# Con yarn
yarn global add supabase
```

### Passo 2: Configura le Credenziali

1. **Crea un file `.env.local`** (se non esiste già):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_ACCESS_TOKEN=your_access_token
   ```

2. **Ottieni l'Access Token**:
   - Vai su [supabase.com/account/tokens](https://supabase.com/account/tokens)
   - Crea un nuovo access token
   - Copialo nel file `.env.local`

### Passo 3: Inizializza il Progetto

```bash
# Nel terminale, dalla root del progetto
supabase init
```

### Passo 4: Collega il Progetto Remoto

```bash
# Sostituisci con il tuo project reference
supabase link --project-ref your-project-ref
```

### Passo 5: Push delle Migration

```bash
# Pusha tutte le migration
supabase db push

# Oppure pusha una migration specifica
supabase db push --include-all
```

## 🔍 Verifica del Deployment

### 1. Controlla le Tabelle

Nel SQL Editor di Supabase:

```sql
-- Lista tutte le tabelle
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. Controlla le Policy RLS

```sql
-- Lista tutte le policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Controlla lo Storage

```sql
-- Verifica il bucket
SELECT * FROM storage.buckets;

-- Verifica le policy dello storage
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### 4. Test delle Funzionalità

```sql
-- Test inserimento itinerario (sostituisci con un user_id valido)
INSERT INTO itineraries (user_id, title, description, start_date, end_date)
VALUES (
  'your-user-id-here',
  'Test Itinerary',
  'Test Description',
  '2024-03-01',
  '2024-03-15'
);

-- Verifica l'inserimento
SELECT * FROM itineraries WHERE title = 'Test Itinerary';
```

## 🚨 Risoluzione Problemi

### Problema: "Permission Denied"

**Causa**: RLS policies bloccano l'accesso
**Soluzione**: 
1. Verifica di essere loggato
2. Controlla che l'user_id corrisponda al tuo utente
3. Verifica le policy RLS

### Problema: "Foreign Key Violation"

**Causa**: Stai cercando di inserire dati che referenziano record inesistenti
**Soluzione**: 
1. Inserisci prima i record padre
2. Verifica che gli ID esistano

### Problema: "Bucket Not Found"

**Causa**: Il bucket storage non è stato creato
**Soluzione**: 
1. Esegui di nuovo la migration dello storage
2. Verifica che il bucket "attachments" esista

### Problema: "Migration Already Applied"

**Causa**: Le migration sono già state eseguite
**Soluzione**: 
1. Usa `supabase db reset` per resettare (ATTENZIONE: cancella tutti i dati)
2. Oppure ignora l'errore se le migration sono corrette

## 📞 Supporto

Se hai problemi:

1. **Controlla i log** nel dashboard di Supabase
2. **Verifica le policy RLS** con le query sopra
3. **Testa con dati semplici** prima di usare dati complessi
4. **Consulta la documentazione** di Supabase

## 🎯 Prossimi Passi

Dopo aver deployato il database:

1. **Configura l'autenticazione** nel tuo progetto Next.js
2. **Testa le funzionalità** di upload file
3. **Implementa le API routes** per operazioni complesse
4. **Configura il real-time** se necessario

---

**Nota**: Il metodo SQL Editor è più semplice per iniziare. Il CLI è utile per progetti più grandi o per automatizzare il deployment. 