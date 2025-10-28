"""
Application Web Vulnérable - Démonstration A09:2021
Patch: correction de admin_required + simple système de session

ATTENTION: Cette application est DÉLIBÉRMENT vulnérable à des fins pédagogiques.
NE JAMAIS utiliser ce code en production!
"""

from flask import Flask, render_template, request, jsonify, send_file, session
import logging
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime
import json
import hashlib
import time

from functools import wraps
from flask import abort

app = Flask(__name__)
# clef de session simple pour démonstration (ne PAS utiliser en prod sans la protéger)
app.secret_key = os.environ.get('FLASK_SECRET', 'dev-secret-for-demo')

# Configuration du système de logs (VULNÉRABLE)
LOG_FILE = 'app.log'
SENSITIVE_LOG_FILE = 'sensitive.log'

# Configuration du logger principal
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=10240000, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
file_handler.setLevel(logging.DEBUG)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.DEBUG)

# Logger pour les données sensibles (TRÈS VULNÉRABLE)
sensitive_logger = logging.getLogger('sensitive')
sensitive_handler = RotatingFileHandler(SENSITIVE_LOG_FILE, maxBytes=10240000, backupCount=5)
sensitive_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
sensitive_logger.addHandler(sensitive_handler)
sensitive_logger.setLevel(logging.DEBUG)

# Base de données simulée (en mémoire)
users_db = {
    'admin': {'password': 'admin123', 'role': 'admin', 'email': 'admin@example.com'},
    'user1': {'password': 'password123', 'role': 'user', 'email': 'user1@example.com'},
    'john.doe': {'password': 'MyS3cr3tP@ss', 'role': 'user', 'email': 'john.doe@company.com'},
    'alice': {'password': 'alice2024!', 'role': 'user', 'email': 'alice@example.com'}
}

# Historique des actions (pour démonstration)
action_history = []


# --- Helpers d'authentification ---
def is_authenticated():
    """Vérifie si un utilisateur est présent dans la session."""
    return 'user' in session


def get_current_user():
    """Retourne le nom d'utilisateur courant ou None."""
    return session.get('user')


def is_admin():
    """Vérifie si l'utilisateur courant a le rôle 'admin'."""
    user = get_current_user()
    if not user:
        return False
    info = users_db.get(user)
    return info and info.get('role') == 'admin'


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Vérifier l'authentification et les permissions
        if not is_authenticated() or not is_admin():
            # utiliser app.logger (logger local non défini dans l'original)
            app.logger.warning(f"Unauthorized log access attempt from {request.remote_addr}")
            abort(403)
        return f(*args, **kwargs)
    return decorated_function


@app.before_request
def log_request():
    """Log toutes les requêtes - VULNÉRABLE: logs excessifs"""
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    app.logger.info(f"Request from {remote_addr}: {request.method} {request.path} - Query: {request.args}")
    
    # Log des headers (VULNÉRABLE - peut contenir des tokens)
    app.logger.debug(f"Headers: {dict(request.headers)}")


@app.route('/')
def index():
    """Page d'accueil"""
    app.logger.info("Homepage accessed")
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Page de connexion - VULNÉRABILITÉ: logs des credentials"""
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
        
        # WARNING: pour la démo on conserve le comportement de l'application originale qui logge
        app.logger.warning(f"Login attempt - Username: {username}")
        # on évite désormais de logger le mot de passe en clair dans le fichier principal
        sensitive_logger.critical(f"CREDENTIALS - User: {username}, Pass: {password}, IP: {remote_addr}")
        
        # Vérification
        if username in users_db and users_db[username]['password'] == password:
            app.logger.info(f"Successful login for user: {username}")
            sensitive_logger.info(f"Session created - User: {username}, Email: {users_db[username]['email']}")
            
            # --- Nouvel élément: stocker l'utilisateur dans la session ---
            session['user'] = username
            session['role'] = users_db[username]['role']
            
            action_history.append({
                'timestamp': datetime.now().isoformat(),
                'action': 'login_success',
                'user': username,
                'ip': remote_addr
            })
            
            return jsonify({
                'success': True, 
                'message': 'Connexion réussie!',
                'user': username,
                'role': users_db[username]['role']
            })
        else:
            app.logger.warning(f"Failed login attempt for user: {username}")
            # VULNÉRABILITÉ: Révèle si l'utilisateur existe -> on conserve pour la démo
            if username not in users_db:
                app.logger.info(f"User '{username}' does not exist in database")
            else:
                app.logger.info(f"Invalid password for existing user '{username}'")
            
            action_history.append({
                'timestamp': datetime.now().isoformat(),
                'action': 'login_failed',
                'user': username,
                'ip': remote_addr
            })
            
            return jsonify({'success': False, 'message': 'Identifiants invalides'}), 401
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    """Déconnecte l'utilisateur (démo)."""
    user = session.pop('user', None)
    session.pop('role', None)
    app.logger.info(f"User '{user}' logged out")
    return jsonify({'success': True, 'message': 'Déconnecté'})


@app.route('/api/transfer', methods=['POST'])
def transfer():
    """Simulation de transfert d'argent - VULNÉRABILITÉ: logs détaillés"""
    data = request.get_json()
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    
    from_account = data.get('from')
    to_account = data.get('to')
    amount = data.get('amount')
    
    # VULNÉRABILITÉ: Log de toutes les transactions financières
    sensitive_logger.critical(
        f"FINANCIAL TRANSACTION - From: {from_account}, To: {to_account}, "
        f"Amount: ${amount}, IP: {remote_addr}, "
        f"Timestamp: {datetime.now().isoformat()}"
    )
    
    app.logger.info(f"Transfer initiated: ${amount} from {from_account} to {to_account}")
    
    action_history.append({
        'timestamp': datetime.now().isoformat(),
        'action': 'transfer',
        'from': from_account,
        'to': to_account,
        'amount': amount,
        'ip': remote_addr
    })
    
    return jsonify({'success': True, 'message': 'Transfert effectué'})


@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    """Mise à jour du profil - VULNÉRABILITÉ: logs de données personnelles"""
    data = request.get_json()
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    
    # VULNÉRABILITÉ: Log de données personnelles (PII)
    sensitive_logger.warning(
        f"PROFILE UPDATE - User: {data.get('username')}, "
        f"Email: {data.get('email')}, Phone: {data.get('phone')}, "
        f"SSN: {data.get('ssn')}, Address: {data.get('address')}, "
        f"IP: {remote_addr}"
    )
    
    app.logger.info(f"Profile updated for user: {data.get('username')}")
    
    return jsonify({'success': True, 'message': 'Profil mis à jour'})


@app.route('/logs')
@admin_required
def view_logs():
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    app.logger.warning(f"Logs accessed from IP: {remote_addr}")
    return render_template('logs.html')


@app.route('/api/logs')
def get_logs():
    """VULNÉRABILITÉ CRITIQUE: API publique pour récupérer les logs!"""
    log_type = request.args.get('type', 'app')
    lines = int(request.args.get('lines', 100))
    
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    app.logger.info(f"Log API accessed - Type: {log_type}, Lines: {lines}, IP: {remote_addr}")
    
    try:
        if log_type == 'sensitive':
            log_file = SENSITIVE_LOG_FILE
        else:
            log_file = LOG_FILE
        
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                all_lines = f.readlines()
                log_lines = all_lines[-lines:]
                return jsonify({
                    'success': True,
                    'logs': ''.join(log_lines),
                    'total_lines': len(all_lines)
                })
        else:
            return jsonify({'success': False, 'message': 'Log file not found'}), 404
    except Exception as e:
        app.logger.error(f"Error reading logs: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/download-logs')
def download_logs():
    """VULNÉRABILITÉ CRITIQUE: Téléchargement direct des fichiers de logs!"""
    log_type = request.args.get('type', 'app')
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    
    app.logger.warning(f"Log download requested - Type: {log_type}, IP: {remote_addr}")
    
    if log_type == 'sensitive':
        log_file = SENSITIVE_LOG_FILE
    else:
        log_file = LOG_FILE
    
    if os.path.exists(log_file):
        return send_file(log_file, as_attachment=True)
    else:
        return jsonify({'success': False, 'message': 'Log file not found'}), 404


@app.route('/api/search-logs')
def search_logs():
    """VULNÉRABILITÉ: Recherche dans les logs sans authentification"""
    query = request.args.get('q', '')
    log_type = request.args.get('type', 'app')
    remote_addr = request.environ.get('REMOTE_ADDR', 'unknown')
    
    app.logger.info(f"Log search - Query: '{query}', Type: {log_type}, IP: {remote_addr}")
    
    if log_type == 'sensitive':
        log_file = SENSITIVE_LOG_FILE
    else:
        log_file = LOG_FILE
    
    results = []
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            for line_num, line in enumerate(f, 1):
                if query.lower() in line.lower():
                    results.append({'line': line_num, 'content': line.strip()})
    
    return jsonify({'success': True, 'results': results, 'count': len(results)})


@app.route('/api/stats')
def get_stats():
    """Statistiques de l'application"""
    return jsonify({
        'total_actions': len(action_history),
        'recent_actions': action_history[-10:],
        'users_count': len(users_db),
        'log_files': {
            'app_log_size': os.path.getsize(LOG_FILE) if os.path.exists(LOG_FILE) else 0,
            'sensitive_log_size': os.path.getsize(SENSITIVE_LOG_FILE) if os.path.exists(SENSITIVE_LOG_FILE) else 0
        }
    })

if __name__ == '__main__':
    # Créer quelques logs initiaux pour la démonstration
    app.logger.info("=" * 80)
    app.logger.info("Application started - Vulnerable Logging Demo")
    app.logger.info("=" * 80)
    sensitive_logger.critical("SYSTEM STARTUP - Admin credentials: admin/admin123")
    
    print("\n" + "="*80)
    print("⚠️  APPLICATION VULNÉRABLE - À DES FINS PÉDAGOGIQUES UNIQUEMENT ⚠️")
    print("="*80)
    print("\nDémonstration de: A09:2021 – Security Logging and Monitoring Failures")
    print("\nAccès:")
    print("  - Application: http://localhost:5000")
    print("  - Logs (VULNÉRABLE): http://localhost:5000/logs")
    print("\nComptes de test:")
    print("  - admin / admin123")
    print("  - user1 / password123")
    print("="*80 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
