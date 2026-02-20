# Souvenirs d'Antan - Album Nostalgie Authentique

## Concept
Un album photo retrouvé dans le grenier de grand-mère. Design vintage authentique évoquant les photos sépia du début du XXe siècle.

## Palette de Couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| Sépia Chaud | `#D4A574` | Titres, accents |
| Crème Vieilli | `#F5F0E6` | Fond principal |
| Brun Cuir | `#6B4423` | Texte corps |
| Or Patiné | `#C9A962` | Highlights, décorations |
| Bleu Nuit | `#2C3E50` | Contraste (pas de noir pur) |

## Typographie

- **Titres:** Cormorant Garamond (sérif élégant)
- **Corps:** Crimson Text (lecture confortable)
- **Interlignage:** 1.8 (généreux, style ancien)

## Effets Implémentés

### ✅ Conservés
- **Grain authentique:** SVG noise en data URI avec animation subtile
- **Texture papier:** Gradients et lignes horizontales fines
- **Vignettage naturel:** Ombres intérieures sur les photos
- **Ombres portées douces:** Box-shadows aux couleurs chaudes
- **Bordures coins cornés:** Pseudo-éléments CSS avec rotations subtiles
- **Photos style 1900-1950:** Filtre sépia CSS + placeholders SVG

### ❌ Interdits (non implémentés)
- Light leaks
- Flou artistique
- Halos lumineux
- Parallaxe
- Dégradés modernes
- Couleurs vives

## Structure des Fichiers

```
nostalgie-authentique/
├── index.html          # Page principale
├── css/
│   └── style.css       # Styles complets
├── images/
│   ├── photo-01.jpg    # Portrait famille (~1920)
│   ├── photo-02.jpg    # Maison ancestrale (1912)
│   ├── photo-03.jpg    # Pique-nique (1935)
│   ├── photo-04.jpg    # Atelier grand-père (1947)
│   ├── photo-05.jpg    # Première école (1938)
│   ├── photo-06.jpg    # Village en hiver (1952)
│   ├── photo-07.jpg    # Mariage (1948)
│   └── photo-08.jpg    # Première auto (1955)
└── README.md           # Ce fichier
```

## Technique Grain

Le grain utilise un SVG noise intégré en data URI:

```css
.grain-overlay {
    background-image: url("data:image/svg+xml,...");
    animation: grain 8s steps(10) infinite;
}
```

Avantages:
- Léger (pas de fichier externe)
- Animé subtilement
- Superposition globale

## Responsive

- **Desktop:** Grille 2-3 colonnes selon la largeur
- **Tablette:** 2 colonnes
- **Mobile:** 1 colonne, grain réduit
- **Print:** Optimisé sans animations

## Accessibilité

- Respect de `prefers-reduced-motion`
- Support de `prefers-contrast: high`
- Balises sémantiques HTML5
- Alt text sur les images

## Remplacement des Images

Les fichiers `.jpg` actuels sont des placeholders SVG. Pour les vraies photos:

1. Remplacer les fichiers dans `/images/`
2. Format recommandé: JPG compressé (optimisé web)
3. Taille suggérée: 800-1200px de large
4. Le CSS applique automatiquement le filtre sépia

---

**Créé pour Denis** - Design validé par Critique
