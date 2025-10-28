# 🔓 Vulnerable Logging App - Application Pédagogique

## ⚠️ AVERTISSEMENT IMPORTANT

**Cette application est DÉLIBÉRÉMENT vulnérable et ne doit JAMAIS être utilisée en production!**

Elle a été créée à des fins pédagogiques pour démontrer la vulnérabilité **A09:2021 – Security Logging and Monitoring Failures** du Top 10 OWASP 2021.

## 🎯 Objectif Pédagogique

Cette application démontre les risques liés à une mauvaise gestion des logs et du monitoring de sécurité, notamment:

- **Exposition publique des logs** sans authentification
- **Mots de passe en clair** dans les logs
- **Données personnelles (PII)** loggées sans masquage
- **Transactions financières** détaillées dans les logs
- **Téléchargement direct** des fichiers de logs
- **Recherche dans les logs** sans restriction

## 🚀 Installation

### Prérequis

- Python 3.8 ou supérieur
- pip

### Installation des dépendances

```bash
cd VulnerableLoggingApp
pip install -r requirements.txt
```

## 🏃 Lancement de l'Application

```bash
python app.py
```

L'application sera accessible à l'adresse: **http://localhost:5000**

## 🔍 Exploration des Vulnérabilités

### 1. Page d'Accueil
- **URL:** http://localhost:5000
- Présentation générale de l'application et des vulnérabilités

### 2. Page de Connexion
- **URL:** http://localhost:5000/login
- Testez avec les comptes suivants:
  - `admin` / `admin123`
  - `user1` / `password123`
  - `john.doe` / `MyS3cr3tP@ss`
  - `alice` / `alice2024!`

### 3. Page des Logs (VULNÉRABLE!)
- **URL:** http://localhost:5000/logs
- Accès **PUBLIC** aux logs sans authentification
- Visualisation de tous les logs de l'application
- Recherche dans les logs
- Téléchargement des fichiers de logs

### 4. Documentation
- **URL:** http://localhost:5000/documentation
- Guide complet sur la vulnérabilité A09:2021
- Explications détaillées des risques
- Bonnes pratiques de sécurité

## 🧪 Scénarios de Test

### Scénario 1: Vol de Credentials

1. Connectez-vous avec un compte (ex: `admin` / `admin123`)
2. Allez sur http://localhost:5000/logs
3. Sélectionnez "Logs Sensibles (sensitive.log)"
4. Recherchez "CREDENTIALS" ou "password"
5. **Constatez que tous les mots de passe sont visibles en clair!**

### Scénario 2: Espionnage Financier

1. Sur la page de connexion, testez le formulaire de transfert d'argent
2. Effectuez un transfert (ex: de "compte123" vers "compte456", montant: 1000)
3. Allez voir les logs sensibles
4. Recherchez "FINANCIAL"
5. **Constatez que toutes les transactions sont loggées avec tous les détails!**

### Scénario 3: Vol de Données Personnelles

1. Sur la page de connexion, testez le formulaire de mise à jour de profil
2. Remplissez avec des données fictives (email, téléphone, SSN, adresse)
3. Allez voir les logs sensibles
4. Recherchez "PROFILE UPDATE"
5. **Constatez que toutes les données personnelles sont exposées!**

### Scénario 4: Téléchargement des Logs

1. Allez sur http://localhost:5000/logs
2. Cliquez sur "⬇️ Télécharger"
3. **Constatez que n'importe qui peut télécharger tous les logs!**

## 📊 API Endpoints (Tous Vulnérables!)

### GET /api/logs
Récupère les logs sans authentification
```bash
curl "http://localhost:5000/api/logs?type=sensitive&lines=100"
```

### GET /api/download-logs
Télécharge les fichiers de logs
```bash
curl "http://localhost:5000/api/download-logs?type=sensitive" -o logs.txt
```

### GET /api/search-logs
Recherche dans les logs
```bash
curl "http://localhost:5000/api/search-logs?q=password&type=sensitive"
```

### GET /api/stats
Statistiques de l'application
```bash
curl "http://localhost:5000/api/stats"
```

## 🔴 Vulnérabilités Démontrées

### 1. Exposition Publique des Logs (CRITIQUE)
- Les logs sont accessibles via des URLs publiques
- Aucune authentification requise
- Permet à n'importe qui de lire tous les logs

### 2. Mots de Passe en Clair (CRITIQUE)
```python
# Code vulnérable dans app.py
app.logger.warning(f"Login attempt - Username: {username}, Password: {password}")
```

### 3. Données Financières Loggées (HAUTE)
```python
# Code vulnérable dans app.py
sensitive_logger.critical(
    f"FINANCIAL TRANSACTION - From: {from_account}, To: {to_account}, Amount: ${amount}"
)
```

### 4. Données Personnelles (PII) Loggées (HAUTE)
- Emails, téléphones, numéros de sécurité sociale, adresses
- Tous loggés sans masquage

### 5. Recherche Sans Authentification (MOYENNE)
- API de recherche publique dans les logs
- Facilite l'extraction de données sensibles

### 6. Révélation de la Structure Interne (MOYENNE)
- Les logs révèlent les routes, paramètres, structure de l'application
- Facilite la découverte d'autres vulnérabilités

## ✅ Comment Corriger Ces Vulnérabilités

### 1. Ne JAMAIS Logger de Données Sensibles

❌ **Mauvais:**
```python
logger.info(f"Login: {username}, Password: {password}")
```

✅ **Bon:**
```python
logger.info(f"Login attempt for user: {username}")
```

### 2. Protéger l'Accès aux Logs

- Authentification forte requise (MFA recommandé)
- Contrôle d'accès basé sur les rôles (RBAC)
- Logs stockés hors du webroot
- Permissions système restrictives (chmod 600)

### 3. Masquer les Données Sensibles

```python
def mask_data(data, visible=4):
    if len(data) <= visible:
        return '*' * len(data)
    return '*' * (len(data) - visible) + data[-visible:]

# Utilisation
logger.info(f"Card: {mask_data(card_number)}")
# Résultat: Card: ************1234
```

### 4. Rotation et Chiffrement des Logs

- Rotation automatique des logs
- Chiffrement des logs archivés
- Politique de rétention claire
- Suppression sécurisée

### 5. Monitoring et Alertes

- Monitoring en temps réel des événements de sécurité
- Alertes automatiques sur activités suspectes
- Détection d'anomalies
- Intégration avec un SIEM

## 📚 Ressources Supplémentaires

- [OWASP A09:2021 – Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP Top 10 2021](https://owasp.org/Top10/)

## 🎓 Utilisation Pédagogique

Cette application peut être utilisée dans les contextes suivants:

- **Cours de sécurité informatique**
- **Formations en cybersécurité**
- **Ateliers pratiques (CTF)**
- **Démonstrations de vulnérabilités**
- **Sensibilisation à la sécurité**

## ⚖️ Conformité et Réglementations

Les vulnérabilités démontrées dans cette application violent plusieurs réglementations:

- **RGPD:** Exposition de données personnelles
- **PCI-DSS:** Stockage non sécurisé de données de paiement
- **HIPAA:** Protection inadéquate des données de santé (si applicable)

## 🛡️ Bonnes Pratiques de Logging

### Que Logger?
✅ Tentatives de connexion (succès/échec)  
✅ Changements de permissions  
✅ Accès aux ressources sensibles  
✅ Erreurs et exceptions  
✅ Modifications de configuration  

❌ Mots de passe  
❌ Tokens d'authentification  
❌ Données personnelles complètes  
❌ Données financières complètes  

### Niveaux de Log en Production
- **WARNING** et plus uniquement
- **DEBUG** désactivé en production
- Logs structurés (JSON recommandé)
- Contexte suffisant pour le debugging

## 📝 Structure du Projet

```
VulnerableLoggingApp/
├── app.py                      # Application Flask principale
├── requirements.txt            # Dépendances Python
├── README.md                   # Ce fichier
├── app.log                     # Logs de l'application (généré)
├── sensitive.log               # Logs sensibles (généré)
├── templates/
│   ├── index.html             # Page d'accueil
│   ├── login.html             # Page de connexion
│   ├── logs.html              # Page de visualisation des logs
│   └── documentation.html     # Documentation complète
└── static/
    ├── css/
    │   └── style.css          # Styles CSS
    └── js/
        ├── app.js             # JavaScript pour login
        └── logs.js            # JavaScript pour logs
```

## 🔧 Configuration

L'application utilise les paramètres par défaut suivants:

- **Port:** 5000
- **Host:** 0.0.0.0 (accessible depuis le réseau local)
- **Debug:** True (pour démonstration)
- **Fichiers de logs:** app.log et sensitive.log (dans le répertoire courant)

## 🚨 Rappel de Sécurité

**NE JAMAIS:**
- Utiliser ce code en production
- Exposer cette application sur Internet
- Utiliser les patterns de code démontrés dans de vraies applications
- Logger des mots de passe ou données sensibles

**TOUJOURS:**
- Protéger l'accès aux logs
- Masquer les données sensibles
- Implémenter un monitoring de sécurité
- Suivre les bonnes pratiques OWASP

## 📧 Contact

Cette application a été créée à des fins pédagogiques uniquement.

---

**⚠️ RAPPEL: Cette application est DÉLIBÉRÉMENT vulnérable. Ne jamais utiliser en production! ⚠️**
