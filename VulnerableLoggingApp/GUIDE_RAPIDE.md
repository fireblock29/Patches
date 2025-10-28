# 🚀 Guide Rapide - Vulnerable Logging App

## Démarrage Rapide

```bash
cd /home/lucas/CascadeProjects/VulnerableLoggingApp
pip install -r requirements.txt
python app.py
```

Accédez à: **http://localhost:5000**

## 🎯 Démonstration en 5 Minutes

### 1️⃣ Connectez-vous (30 secondes)
- Allez sur http://localhost:5000/login
- Utilisez: `admin` / `admin123`
- Cliquez sur "Se connecter"

### 2️⃣ Accédez aux logs vulnérables (30 secondes)
- Cliquez sur "📋 Voir les Logs" dans le menu
- **Constatez**: Aucune authentification requise!

### 3️⃣ Trouvez les mots de passe (1 minute)
- Sélectionnez "Logs Sensibles (sensitive.log)"
- Cliquez sur le bouton "🔑 Mots de passe"
- **CHOC**: Tous les mots de passe sont en clair!

### 4️⃣ Testez une transaction (1 minute)
- Retournez sur /login
- Remplissez le formulaire de transfert:
  - De: `compte123`
  - Vers: `compte456`
  - Montant: `1000`
- Retournez aux logs sensibles
- Recherchez "FINANCIAL"
- **Constatez**: Transaction complète loggée!

### 5️⃣ Téléchargez les logs (30 secondes)
- Sur la page des logs, cliquez "⬇️ Télécharger"
- **Constatez**: N'importe qui peut télécharger tous les logs!

## 🔥 Points Clés à Retenir

### ❌ Ce qui ne va PAS
1. **Logs publics** - Accessibles sans authentification
2. **Mots de passe en clair** - Violation critique
3. **Données personnelles exposées** - Non-conformité RGPD
4. **Transactions financières** - Toutes les détails visibles
5. **Téléchargement libre** - Aucune protection

### ✅ Ce qu'il FAUT faire
1. **Authentification forte** pour accéder aux logs
2. **Ne JAMAIS logger** de mots de passe
3. **Masquer les données sensibles** (ex: `****1234`)
4. **Logs hors du webroot** (ex: `/var/log/`)
5. **Chiffrement** des logs archivés
6. **Monitoring actif** des accès aux logs

## 📊 Comptes de Test

| Utilisateur | Mot de passe | Rôle |
|------------|--------------|------|
| admin | admin123 | Administrateur |
| user1 | password123 | Utilisateur |
| john.doe | MyS3cr3tP@ss | Utilisateur |
| alice | alice2024! | Utilisateur |

## 🔍 URLs Importantes

- **Accueil**: http://localhost:5000
- **Connexion**: http://localhost:5000/login
- **Logs (VULNÉRABLE)**: http://localhost:5000/logs
- **Documentation**: http://localhost:5000/documentation

## 💡 Scénarios d'Attaque

### Attaque 1: Vol de Credentials
```bash
curl "http://localhost:5000/api/search-logs?q=CREDENTIALS&type=sensitive"
# Résultat: Tous les mots de passe!
```

### Attaque 2: Téléchargement des Logs
```bash
curl "http://localhost:5000/api/download-logs?type=sensitive" -o stolen_logs.txt
# Résultat: Fichier complet téléchargé!
```

### Attaque 3: Espionnage Financier
```bash
curl "http://localhost:5000/api/search-logs?q=FINANCIAL&type=sensitive"
# Résultat: Toutes les transactions!
```

## ⚠️ RAPPEL IMPORTANT

**Cette application est DÉLIBÉRÉMENT vulnérable!**

- ❌ Ne JAMAIS utiliser en production
- ❌ Ne JAMAIS exposer sur Internet
- ✅ Utilisation pédagogique uniquement
- ✅ Démonstration de A09:2021 OWASP

## 📚 Pour Aller Plus Loin

Consultez la documentation complète:
http://localhost:5000/documentation

---

**Créé pour démontrer: A09:2021 – Security Logging and Monitoring Failures**
