# Pour déployer une version patchable de Juice-shop : 
```shell
git clone https://github.com/juice-shop/juice-shop/
cd juice-shop
docker build -t juice-shop:local .
docker run -p 3000:3000 juice-shop:local
```

Le temps de build est très long, il faut patienter. Après chaque modification, il faut refaire le build et le redémarrer.

# Pour arrêter le container : 
```shell
docker stop juice-shop
```

# Pour patcher le container : 
Modifier les fichiers de votre choix dans le dossier juice-shop
Refaire le build
Redémarrer le container





# Pour patcher DVWA :
Modifier les fichiers dans le container avec docker exec -it dvwa.
Vous pouvez copier un fichier de patch avec :
```shell
docker cp /chemin/vers/le/fichier dvwa:/chemin/vers/le/fichier
```



# Pour déployer l'app vulnérable : 
```shell
python3 app.py
```

# Pour patcher l'app vulnérable : 
Modifier les fichiers de votre choix dans le dossier VulnerableLoggingApp
Relancer :
```shell
python3 app.py
```

