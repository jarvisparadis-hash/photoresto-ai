/**
 * PhotoResto AI - Script de commande
 * Gestion du formulaire, tarifs et validation
 */

(function() {
    'use strict';
    
    // ========================================================================
    // CONFIGURATION
    // ========================================================================
    const CONFIG = {
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        packNames: {
            'famille3': 'Pack Famille 3 (3 photos)',
            'famille5': 'Pack Famille 5 (5 photos)',
            'heritage10': 'Pack Héritage 10 (10 photos)',
            'heritage20': 'Pack Héritage 20 (20 photos)'
        },
        serviceNames: {
            'restauration': 'Solo Restauration',
            'colorisation': 'Solo Colorisation',
            'upscaling': 'Solo Upscaling',
            'combo': 'Combo Full (restauration + colorisation + upscaling)'
        },
        optionNames: {
            'rush': 'Livraison Rush (+5€ TTC/photo)',
            'express': 'Livraison Express (+10€ TTC/photo)',
            'print': 'Tirage papier (+4€ TTC/photo)',
            'cadre': 'Avec cadre (+15€ TTC/photo)'
        }
    };
    
    // ========================================================================
    // ÉTAT DE LA COMMANDE
    // ========================================================================
    const orderState = {
        type: null,        // 'solo' ou 'pack'
        service: null,     // service solo sélectionné
        pack: null,        // pack sélectionné
        photos: 1,         // nombre de photos
        basePrice: 0,      // prix de base
        options: [],       // options sélectionnées
        files: []          // fichiers uploadés
    };
    
    // ========================================================================
    // UTILITAIRES
    // ========================================================================
    function formatPrice(price) {
        return price.toFixed(2).replace('.00', '') + '€ TTC';
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' o';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
    }
    
    // ========================================================================
    // GESTION SÉLECTION SERVICES / PACKS
    // ========================================================================
    function initSelectionHandlers() {
        // Boutons services solo
        document.querySelectorAll('.btn-select-service').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                selectService(this);
            });
        });
        
        // Boutons packs
        document.querySelectorAll('.btn-select-pack').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                selectPack(this);
            });
        });
    }
    
    function clearSelection() {
        // Retirer la classe selected de toutes les cartes
        document.querySelectorAll('.pricing-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.pricing-cta').forEach(btn => {
            btn.classList.remove('btn-selected');
            btn.textContent = btn.dataset.service ? 'Sélectionner' : 'Choisir ce pack';
        });
    }
    
    function selectService(btn) {
        clearSelection();
        
        const service = btn.dataset.service;
        const price = parseInt(btn.dataset.price);
        const card = btn.closest('.pricing-card');
        
        orderState.type = 'solo';
        orderState.service = service;
        orderState.pack = null;
        orderState.photos = 1;
        orderState.basePrice = price;
        
        card.classList.add('selected');
        btn.classList.add('btn-selected');
        btn.textContent = '✓ Sélectionné';
        
        updateSummary();
    }
    
    function selectPack(btn) {
        clearSelection();
        
        const pack = btn.dataset.pack;
        const photos = parseInt(btn.dataset.photos);
        const price = parseInt(btn.dataset.price);
        const card = btn.closest('.pricing-card');
        
        orderState.type = 'pack';
        orderState.service = null;
        orderState.pack = pack;
        orderState.photos = photos;
        orderState.basePrice = price;
        
        card.classList.add('selected');
        btn.classList.add('btn-selected');
        btn.textContent = '✓ Sélectionné';
        
        updateSummary();
    }
    
    // ========================================================================
    // GESTION OPTIONS
    // ========================================================================
    function initOptionsHandlers() {
        document.querySelectorAll('input[name="option"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateOptions();
            });
        });
    }
    
    function updateOptions() {
        orderState.options = [];
        
        document.querySelectorAll('input[name="option"]:checked').forEach(checkbox => {
            orderState.options.push({
                name: checkbox.value,
                price: parseInt(checkbox.dataset.price)
            });
        });
        
        updateSummary();
    }
    
    // ========================================================================
    // RÉCAPITULATIF
    // ========================================================================
    function updateSummary() {
        const summaryEmpty = document.querySelector('.summary-empty');
        const summaryContent = document.querySelector('.summary-content');
        const selectionText = document.getElementById('summary-selection-text');
        const optionsList = document.getElementById('summary-options-list');
        const totalAmount = document.getElementById('summary-total');
        
        if (!orderState.type) {
            summaryEmpty.style.display = 'block';
            summaryContent.style.display = 'none';
            return;
        }
        
        summaryEmpty.style.display = 'none';
        summaryContent.style.display = 'block';
        
        // Texte sélection
        if (orderState.type === 'pack') {
            selectionText.innerHTML = `<strong>${CONFIG.packNames[orderState.pack]}</strong><br>
                <span style="color: var(--brun-light); font-size: 0.95rem;">
                    Soit ${(orderState.basePrice / orderState.photos).toFixed(2).replace('.00', '')}€ TTC / photo
                </span>`;
        } else {
            selectionText.innerHTML = `<strong>${CONFIG.serviceNames[orderState.service]}</strong><br>
                <span style="color: var(--brun-light); font-size: 0.95rem;">
                    1 photo à ${orderState.basePrice}€ TTC
                </span>`;
        }
        
        // Options
        if (orderState.options.length === 0) {
            optionsList.innerHTML = '<li style="color: var(--brun-light); font-style: italic;">Aucune option</li>';
        } else {
            optionsList.innerHTML = orderState.options.map(opt => 
                `<li>✓ ${CONFIG.optionNames[opt.name]}</li>`
            ).join('');
        }
        
        // Calcul total
        const total = calculateTotal();
        totalAmount.textContent = formatPrice(total);
    }
    
    function calculateTotal() {
        let total = orderState.basePrice;
        
        // Ajouter les options (par photo)
        const optionsTotal = orderState.options.reduce((sum, opt) => sum + opt.price, 0);
        total += optionsTotal * orderState.photos;
        
        return total;
    }
    
    // ========================================================================
    // UPLOAD FICHIERS
    // ========================================================================
    function initUploadHandlers() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('photo-upload');
        const uploadList = document.getElementById('upload-list');
        const uploadError = document.getElementById('upload-error');
        
        // Drag & drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('drag-over');
            });
        });
        
        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
        
        fileInput.addEventListener('change', () => {
            handleFiles(fileInput.files);
        });
    }
    
    function handleFiles(files) {
        const uploadList = document.getElementById('upload-list');
        const uploadError = document.getElementById('upload-error');
        
        uploadError.textContent = '';
        orderState.files = [];
        uploadList.innerHTML = '';
        
        let hasError = false;
        
        Array.from(files).forEach(file => {
            // Vérifier le type
            if (!file.type.startsWith('image/')) {
                hasError = true;
                uploadList.innerHTML += `
                    <div class="file-item">
                        <span class="file-name">${file.name}</span>
                        <span class="file-error">❌ Format non supporté</span>
                    </div>`;
                return;
            }
            
            // Vérifier la taille
            if (file.size > CONFIG.maxFileSize) {
                hasError = true;
                uploadList.innerHTML += `
                    <div class="file-item">
                        <span class="file-name">${file.name}</span>
                        <span class="file-error">❌ Fichier trop volumineux (max 10 Mo)</span>
                    </div>`;
                return;
            }
            
            // Fichier valide
            orderState.files.push(file);
            uploadList.innerHTML += `
                <div class="file-item">
                    <span class="file-name">📷 ${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>`;
        });
        
        if (hasError) {
            uploadError.textContent = 'Certains fichiers n\'ont pas pu être ajoutés.';
        }
    }
    
    // ========================================================================
    // VALIDATION FORMULAIRE
    // ========================================================================
    function initFormValidation() {
        const form = document.getElementById('order-form');
        const emailInput = document.getElementById('customer-email');
        const emailError = document.getElementById('email-error');
        
        // Validation email en temps réel
        emailInput.addEventListener('input', function() {
            validateEmail(this.value);
        });
        
        emailInput.addEventListener('blur', function() {
            validateEmail(this.value);
        });
        
        function validateEmail(value) {
            if (!value) {
                emailError.textContent = '';
                emailInput.setCustomValidity('');
                return false;
            }
            
            if (!CONFIG.emailRegex.test(value)) {
                emailError.textContent = 'Veuillez entrer une adresse email valide.';
                emailInput.setCustomValidity('Email invalide');
                return false;
            }
            
            emailError.textContent = '';
            emailInput.setCustomValidity('');
            return true;
        }
        
        // Soumission du formulaire
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Vérifier qu'une sélection a été faite
            if (!orderState.type) {
                alert('Veuillez sélectionner un service ou un pack.');
                return;
            }
            
            // Vérifier les fichiers
            if (orderState.files.length === 0) {
                alert('Veuillez ajouter au moins une photo.');
                document.getElementById('photo-upload').focus();
                return;
            }
            
            // Vérifier l'email
            if (!validateEmail(emailInput.value)) {
                emailInput.focus();
                return;
            }
            
            // Vérifier les champs required
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value || (field.type === 'checkbox' && !field.checked)) {
                    isValid = false;
                    field.classList.add('invalid');
                } else {
                    field.classList.remove('invalid');
                }
            });
            
            if (!isValid) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Simuler l'envoi (à remplacer par vraie logique)
            submitOrder();
        });
    }
    
    function submitOrder() {
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        
        // Simuler un délai d'envoi
        setTimeout(() => {
            alert('Merci ! Votre demande a été envoyée avec succès.\n\nNous vous répondrons sous 48h avec un devis personnalisé.');
            
            // Réinitialiser
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Optionnel: reset du formulaire
            // document.getElementById('order-form').reset();
            // resetOrderState();
        }, 1500);
    }
    
    function resetOrderState() {
        orderState.type = null;
        orderState.service = null;
        orderState.pack = null;
        orderState.photos = 1;
        orderState.basePrice = 0;
        orderState.options = [];
        orderState.files = [];
        
        clearSelection();
        document.querySelectorAll('input[name="option"]').forEach(cb => cb.checked = false);
        updateSummary();
    }
    
    // ========================================================================
    // SCROLL VERS LE FORMULAIRE APRÈS SÉLECTION
    // ========================================================================
    function initScrollBehavior() {
        document.querySelectorAll('.btn-select-service, .btn-select-pack').forEach(btn => {
            btn.addEventListener('click', function() {
                setTimeout(() => {
                    const formSection = document.getElementById('commande');
                    if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            });
        });
    }
    
    // ========================================================================
    // INITIALISATION
    // ========================================================================
    function init() {
        initSelectionHandlers();
        initOptionsHandlers();
        initUploadHandlers();
        initFormValidation();
        initScrollBehavior();
        
        console.log('PhotoResto AI - Script initialisé');
    }
    
    // Lancer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
