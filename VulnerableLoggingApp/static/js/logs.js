// JavaScript pour la page de visualisation des logs

document.addEventListener('DOMContentLoaded', function() {
    // Charger les logs au démarrage
    loadLogs();
    loadStats();
    
    // Rafraîchir les logs
    document.getElementById('refreshLogs').addEventListener('click', function() {
        loadLogs();
        loadStats();
    });
    
    // Télécharger les logs
    document.getElementById('downloadLogs').addEventListener('click', function() {
        const logType = document.getElementById('logType').value;
        window.location.href = `/api/download-logs?type=${logType}`;
    });
    
    // Rechercher dans les logs
    document.getElementById('searchBtn').addEventListener('click', function() {
        searchLogs();
    });
    
    // Effacer la recherche
    document.getElementById('clearSearch').addEventListener('click', function() {
        document.getElementById('searchQuery').value = '';
        document.getElementById('searchResults').classList.remove('active');
        document.getElementById('searchResults').innerHTML = '';
    });
    
    // Recherche avec Enter
    document.getElementById('searchQuery').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLogs();
        }
    });
    
    // Recherches rapides
    document.querySelectorAll('.quick-search').forEach(button => {
        button.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            document.getElementById('searchQuery').value = query;
            searchLogs();
        });
    });
    
    // Rafraîchir automatiquement toutes les 10 secondes
    setInterval(function() {
        loadLogs();
        loadStats();
    }, 10000);
});

async function loadLogs() {
    const logType = document.getElementById('logType').value;
    const lineCount = document.getElementById('lineCount').value;
    const logsContent = document.getElementById('logsContent');
    const logStats = document.getElementById('logStats');
    
    logsContent.textContent = '⏳ Chargement des logs...';
    
    try {
        const response = await fetch(`/api/logs?type=${logType}&lines=${lineCount}`);
        const data = await response.json();
        
        if (data.success) {
            logsContent.textContent = data.logs || 'Aucun log disponible';
            logStats.textContent = `Total: ${data.total_lines} lignes | Affichées: ${lineCount} dernières lignes`;
            
            // Mettre en évidence les données sensibles
            highlightSensitiveData();
        } else {
            logsContent.textContent = `❌ Erreur: ${data.message}`;
        }
    } catch (error) {
        logsContent.textContent = `❌ Erreur de chargement: ${error.message}`;
    }
}

async function searchLogs() {
    const query = document.getElementById('searchQuery').value;
    const logType = document.getElementById('logType').value;
    const searchResults = document.getElementById('searchResults');
    
    if (!query) {
        alert('Veuillez entrer un terme de recherche');
        return;
    }
    
    searchResults.innerHTML = '⏳ Recherche en cours...';
    searchResults.classList.add('active');
    
    try {
        const response = await fetch(`/api/search-logs?q=${encodeURIComponent(query)}&type=${logType}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.count === 0) {
                searchResults.innerHTML = `<p>Aucun résultat trouvé pour "${query}"</p>`;
            } else {
                let html = `<h3>🔍 Résultats de recherche pour "${query}" (${data.count} résultats)</h3>`;
                html += '<div style="max-height: 400px; overflow-y: auto;">';
                
                data.results.forEach(result => {
                    // Mettre en évidence le terme recherché
                    const highlightedContent = result.content.replace(
                        new RegExp(query, 'gi'),
                        match => `<mark style="background: yellow; font-weight: bold;">${match}</mark>`
                    );
                    
                    html += `
                        <div class="search-result-item">
                            <strong>Ligne ${result.line}:</strong><br>
                            <code style="font-size: 0.9rem;">${highlightedContent}</code>
                        </div>
                    `;
                });
                
                html += '</div>';
                searchResults.innerHTML = html;
                
                // Alerte si des données sensibles sont trouvées
                if (query.toLowerCase().includes('password') || 
                    query.toLowerCase().includes('credentials') ||
                    query.toLowerCase().includes('ssn')) {
                    searchResults.innerHTML = `
                        <div style="background: #fee2e2; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                            <strong style="color: #dc2626;">⚠️ DONNÉES SENSIBLES DÉTECTÉES!</strong><br>
                            Vous avez trouvé ${data.count} occurrence(s) de données sensibles dans les logs.
                            En production, cela constituerait une violation de sécurité majeure!
                        </div>
                    ` + searchResults.innerHTML;
                }
            }
        } else {
            searchResults.innerHTML = `<p>❌ Erreur: ${data.message}</p>`;
        }
    } catch (error) {
        searchResults.innerHTML = `<p>❌ Erreur de recherche: ${error.message}</p>`;
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        // Mettre à jour les statistiques
        document.getElementById('totalActions').textContent = data.total_actions;
        document.getElementById('usersCount').textContent = data.users_count;
        document.getElementById('appLogSize').textContent = formatBytes(data.log_files.app_log_size);
        document.getElementById('sensitiveLogSize').textContent = formatBytes(data.log_files.sensitive_log_size);
        
        // Afficher les actions récentes
        const recentActionsDiv = document.getElementById('recentActions');
        if (data.recent_actions && data.recent_actions.length > 0) {
            let html = '<h4>📊 Actions Récentes:</h4>';
            data.recent_actions.forEach(action => {
                const timestamp = new Date(action.timestamp).toLocaleString('fr-FR');
                let actionText = '';
                
                switch(action.action) {
                    case 'login_success':
                        actionText = `✅ Connexion réussie: ${action.user}`;
                        break;
                    case 'login_failed':
                        actionText = `❌ Échec de connexion: ${action.user}`;
                        break;
                    case 'transfer':
                        actionText = `💸 Transfert: $${action.amount} de ${action.from} vers ${action.to}`;
                        break;
                    default:
                        actionText = action.action;
                }
                
                html += `
                    <div class="action-item">
                        <strong>${timestamp}</strong> - ${actionText} (IP: ${action.ip})
                    </div>
                `;
            });
            recentActionsDiv.innerHTML = html;
        }
    } catch (error) {
        console.error('Erreur de chargement des stats:', error);
    }
}

function highlightSensitiveData() {
    const logsContent = document.getElementById('logsContent');
    let content = logsContent.textContent;
    
    // Patterns pour détecter les données sensibles
    const patterns = [
        { regex: /Password:\s*\S+/gi, color: '#dc2626' },
        { regex: /Pass:\s*\S+/gi, color: '#dc2626' },
        { regex: /CREDENTIALS/gi, color: '#dc2626' },
        { regex: /FINANCIAL/gi, color: '#f59e0b' },
        { regex: /SSN:\s*\S+/gi, color: '#dc2626' },
        { regex: /\b[\w\.-]+@[\w\.-]+\.\w+\b/gi, color: '#3b82f6' }
    ];
    
    // Note: Cette fonction est désactivée pour garder le format texte brut
    // mais pourrait être activée pour une meilleure visualisation
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
