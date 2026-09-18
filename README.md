# Suivi de Production des Cartes Électroniques — Infrastructure Cloud AWS

## 📋 Description

Application web de suivi de production des cartes électroniques, développée dans le cadre d'un stage d'été chez **ASTEELFLASH Tunisie**, puis complétée par la conception et le déploiement d'une infrastructure cloud complète sur **Amazon Web Services (AWS)**.

Ce projet illustre :
- Le développement d'une application web (HTML, CSS, JavaScript)
- La conception d'une infrastructure cloud sécurisée et hautement disponible
- Le déploiement d'un backend léger permettant le partage des données entre utilisateurs

## 🏗️ Architecture

```
Utilisateurs (navigateurs multiples)
            ↓
    Load Balancer (Application Load Balancer)
            ↓
    ┌───────┴───────┐
    ↓               ↓
  EC2 (privé)    EC2 (privé)
  Nginx + Node.js (PM2)
    ↓               ↓
    └───────┬───────┘
            ↓
    Amazon S3 (requests.json)
```

## ⚙️ Services AWS utilisés

| Service | Rôle |
|---|---|
| VPC | Réseau privé virtuel, sous-réseaux publics/privés |
| Security Groups | Pare-feu applicatif |
| EC2 | Instances de calcul hébergeant l'application |
| AMI | Image machine réutilisable |
| Application Load Balancer | Répartition de charge et haute disponibilité |
| Target Group | Suivi de l'état de santé des instances |
| NAT Gateway | Accès sortant sécurisé pour les instances privées |
| Amazon S3 | Stockage centralisé des données de production |
| IAM (rôle d'instance) | Accès sécurisé à S3 sans clés d'accès stockées |
| CloudWatch | Surveillance et alertes |
| CloudTrail | Traçabilité et audit des actions |

## 📁 Structure du projet

```
├── Dash.html          # Tableau de bord
├── Production.html    # Création/gestion des requêtes
├── Login.html         # Page de connexion
├── visitor.html       # Vue visiteur (lecture seule)
├── style.css          # Feuille de style
├── logo.png           # Logo de l'entreprise
├── image.png          # Image de fond (page login)
├── script.js          # Logique du tableau de bord
├── Production.js      # Logique de la page Production
├── login.js           # Authentification côté client
├── auth-guard.js      # Protection des pages
├── storage.js         # Communication avec l'API backend
└── server/
    └── server.js       # API backend Node.js (lecture/écriture S3)
```

## 🚀 Fonctionnement

1. L'utilisateur se connecte via la page de login
2. Il peut créer, consulter et suivre les requêtes de production
3. Les données sont stockées de façon centralisée sur Amazon S3
4. Un service Node.js, installé sur chaque instance EC2, expose une API (`/api/requests`) permettant de lire et écrire ces données
5. Le client interroge cette API toutes les 5 secondes pour rester synchronisé avec les autres utilisateurs

## 🔐 Identifiants de démonstration

- **Email** : `admin@asteelflash.com`
- **Mot de passe** : `admin123`

*(à modifier dans `login.js` pour un usage réel)*

## 📝 Contexte

Projet réalisé dans le cadre d'un stage d'été à ASTEELFLASH Tunisie, avec une phase complémentaire de conception d'infrastructure cloud AWS, réalisée sur un environnement AWS Academy Learner Lab.
