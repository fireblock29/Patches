// JavaScript pour la page de connexion et les actions

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = `✅ ${data.message} Bienvenue ${data.user}! Rôle: ${data.role}`;
                    messageDiv.innerHTML += '<br><br>🔍 <a href="/logs">Allez voir les logs pour constater la vulnérabilité!</a>';
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = `❌ ${data.message}`;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = `❌ Erreur: ${error.message}`;
            }
        });
    }
    
    // Gestion du formulaire de transfert
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fromAccount = document.getElementById('fromAccount').value;
            const toAccount = document.getElementById('toAccount').value;
            const amount = document.getElementById('amount').value;
            
            try {
                const response = await fetch('/api/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: fromAccount,
                        to: toAccount,
                        amount: amount
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(`✅ ${data.message}\n\n🔍 Cette transaction a été loggée avec tous les détails!\nAllez voir les logs sensibles pour la retrouver.`);
                    transferForm.reset();
                }
            } catch (error) {
                alert(`❌ Erreur: ${error.message}`);
            }
        });
    }
    
    // Gestion du formulaire de profil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const profileData = {
                username: document.getElementById('profileUsername').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                ssn: document.getElementById('profileSSN').value,
                address: document.getElementById('profileAddress').value
            };
            
            try {
                const response = await fetch('/api/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(`✅ ${data.message}\n\n⚠️ ATTENTION: Toutes vos données personnelles (email, téléphone, SSN, adresse) ont été loggées en clair!\nAllez voir les logs sensibles pour les retrouver.`);
                    profileForm.reset();
                }
            } catch (error) {
                alert(`❌ Erreur: ${error.message}`);
            }
        });
    }
});
