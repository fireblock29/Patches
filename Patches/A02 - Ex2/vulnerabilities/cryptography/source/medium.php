<?php
/**
 * Patché : gestion des tokens avec vérification HMAC avant déchiffrement
 * - Valide la MAC (HMAC-SHA256) sur le ciphertext
 * - Dérive une clé AES-128 à partir du secret (SHA-256 then truncate)
 * - Déchiffre avec OPENSSL_RAW_DATA
 *
 * NOTE: En production, stocker les clés dans un gestionnaire de secrets et ne pas hardcoder.
 */

// --- Fonctions utilitaires de sécurité / chiffrement ---

/**
 * Dérive une clé AES-128 (16 bytes) à partir d'un secret en entrée.
 * Utilise SHA-256 et tronque à 16 octets.
 */
function deriveAes128Key(string $secret) : string {
    return substr(hash('sha256', $secret, true), 0, 16);
}

/**
 * Déchiffrement AES-128-ECB (utilise OPENSSL_RAW_DATA).
 * Receives raw binary ciphertext and returns plaintext string.
 */
function decrypt_aes128_ecb(string $ciphertext_raw, string $key_secret) {
    $key = deriveAes128Key($key_secret);
    $plain = openssl_decrypt($ciphertext_raw, 'aes-128-ecb', $key, OPENSSL_RAW_DATA);
    if ($plain === false) {
        throw new Exception("Decryption failed");
    }
    return $plain;
}

// --- Clés / configuration (pour laboratoire uniquement) ---

/**
 * Clé secrète pour HMAC — **NE JAMAIS** la mettre dans un dépôt public en production.
 * Pour le labo, on la définit localement. En production, utiliser un secret manager.
 */
$HMAC_KEY = 'dvwa_hmac_secret_change_in_prod';

/**
 * Clé secrète principale (utilisée pour AES) — dérivée ensuite par deriveAes128Key.
 * Valeur conservée de l'existant (pour compatibilité labo).
 */
$key = "ik ben een aardbei";

// --- Initialisation des variables pour l'UI ---
$errors = "";
$success = "";
$messages = "";

// --- Traitement POST: vérification HMAC puis déchiffrement sécurisé ---
if ($_SERVER['REQUEST_METHOD'] == "POST") {
    try {
        if (!array_key_exists('token', $_POST)) {
            throw new Exception("No token passed");
        }

        $token_hex = trim($_POST['token']);
        // token hex attendu : hex(ciphertext || hmac)
        if ($token_hex === "" || !ctype_xdigit($token_hex)) {
            throw new Exception("Token is in wrong format");
        }

        $token_bin = hex2bin($token_hex);
        if ($token_bin === false) {
            throw new Exception("Token is in wrong format");
        }

        // Vérifier que le token contient au moins une MAC de 32 octets (SHA-256 raw)
        $hmacLen = 32; // bytes
        if (strlen($token_bin) <= $hmacLen) {
            throw new Exception("Token is in wrong format");
        }

        // Séparer ciphertext et mac
        $hmac_raw = substr($token_bin, -$hmacLen);
        $ciphertext_raw = substr($token_bin, 0, strlen($token_bin) - $hmacLen);

        // Calculer HMAC côté serveur et comparer (authenticité)
        $expected_hmac = hash_hmac('sha256', $ciphertext_raw, $HMAC_KEY, true);
        if (!hash_equals($expected_hmac, $hmac_raw)) {
            // Message générique pour ne pas aider un attaquant
            throw new Exception("Invalid or tampered token");
        }

        // Maintenant on peut déchiffrer en toute sécurité
        $decrypted = decrypt_aes128_ecb($ciphertext_raw, $key);

        $user = json_decode($decrypted);
        if ($user === null) {
            throw new Exception("Could not decode JSON object.");
        }

        if ($user->user == "sweep" && $user->ex > time() && $user->level == "admin") {
            $success = "Welcome administrator Sweep";
        } else {
            $messages = "Login successful but not as the right user.";
        }
    } catch (Exception $e) {
        // Pour le debug en labo, on peut logger côté serveur mais ne pas exposer trop d'infos au client
        // error_log('Token handling error: ' . $e->getMessage());
        $errors = $e->getMessage();
    }
}

// --- Contenu HTML / interface (conserve le contenu original fourni) ---
$html = "
		<p>
		You have managed to get hold of three session tokens for an application you think is using poor cryptography to protect its secrets:
		</p>
		<p>
		<strong>Sooty (admin), session expired</strong>
		</p>
		<p>
<textarea style='width: 600px; height: 56px'>e287af752ed3f9601befd45726785bd9b85bb230876912bf3c66e50758b222d0837d1e6b16bfae07b776feb7afe576305aec34b41499579d3fb6acc8dc92fd5fcea8743c3b2904de83944d6b19733cdb48dd16048ed89967c250ab7f00629dba</textarea>
		</p>
		<p>
		<strong>Sweep (user), session expired</strong>
		</p>
		<p>
<textarea style='width: 600px; height: 56px'>3061837c4f9debaf19d4539bfa0074c1b85bb230876912bf3c66e50758b222d083f2d277d9e5fb9a951e74bee57c77a3caeb574f10f349ed839fbfd223903368873580b2e3e494ace1e9e8035f0e7e07</textarea>
		</p>
		<p>
		<strong>Soo (user), session valid</strong>
		</p>
		<p>
<textarea style='width: 600px; height: 56px'>5fec0b1c993f46c8bad8a5c8d9bb9698174d4b2659239bbc50646e14a70becef83f2d277d9e5fb9a951e74bee57c77a3c9acb1f268c06c5e760a9d728e081fab65e83b9f97e65cb7c7c4b8427bd44abc16daa00fd8cd0105c97449185be77ef5</textarea>
		</p>
		<p>
		Based on the documentation, you know the format of the token is:
		</p>
		<pre><code>{
    \"user\": \"example\",
    \"ex\": 1723620372,
    \"level\": \"user\",
    \"bio\": \"blah\"
}</code></pre>
<p>
You also spot this comment in the docs:
</p>
<blockquote><i>
To ensure your security, we use aes-128-ecb throughout our application.
</i></blockquote>

		<hr>
		<p>
		Manipulate the session tokens you have captured to log in as Sweep with admin privileges.
";

if ($errors != "") {
	$html .= '<div class="warning">' . $errors . '</div>';
}

if ($messages != "") {
	$html .= '<div class="nearly">' . $messages . '</div>';
}

if ($success != "") {
	$html .= '<div class="success">' . $success . '</div>';
}

$html .= "
		<form name=\"ecb\" method='post' action=\"" . $_SERVER['PHP_SELF'] . "\">
			<p>
				<label for='token'>Token:</lable><br />
<textarea style='width: 600px; height: 56px' id='token' name='token'></textarea>
			</p>
			<p>
				<input type=\"submit\" value=\"Submit\">
			</p>
		</form>
";

// Affichage final (le fichier d'origine mettait $html à disposition;
// pour s'assurer que le contenu s'affiche, on l'echo ici)
//echo $html;
?>
