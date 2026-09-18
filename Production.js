import { subscribe, addRecord, updateRecord, deleteRecord } from "./storage.js";

document.addEventListener('DOMContentLoaded', function () {

    const formulaire = document.querySelector('.formulaire');
    const addButton = formulaire.querySelector('input[type="submit"]');
    const list = document.getElementById('allProductionList');
    const emptyState = document.getElementById('emptyState');
    const familleSelect = document.getElementById('famille');
    const carteRefSelect = document.getElementById('carteRef');

    // Cache local des records, tenu à jour automatiquement par subscribe().
    let currentRecords = [];

    const referenceStages = {
        'DNF70CMC03903G00F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF70CVB00728C01F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF70CVB00751L02F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF70CVB00789D01F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF70CVB00793D01F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF70CVB00830C01F': ['TF', 'Emballage'],
        'DNF70CVB00861C01F': ['TF', 'Gluing', 'Emballage'],
        'DNFVB00253M01F': ['TF', 'Etiquetage', 'Assemblage', 'Gluing', 'Emballage'],
        'DNFVB00273K01F': ['TF', 'Etiquetage', 'Assemblage', 'Gluing', 'Emballage'],
        'DNFVB00283M01F': ['TF', 'Etiquetage', 'Assemblage', 'Gluing', 'Emballage'],
        'DNFVB00752K00F': ['TF', 'Emballage'],
        'DNFVB00761Q00F': ['TF', 'Emballage'],
        'DNF70CMC03921G00F': ['TF', 'Assemblage', 'Gluing', 'Emballage'],
        'DNF139Z9760A00F': ['TF', 'Emballage']
    };

    const ordreEtapes = ['TF', 'Etiquetage', 'Assemblage', 'Gluing', 'Emballage'];

    function getStagesEnOrdre(stages) {
        if (!stages) {
            return [];
        }
        return ordreEtapes.filter(function (etape) {
            return Object.prototype.hasOwnProperty.call(stages, etape);
        });
    }

    function computePercent(stages, quantite) {
        quantite = Number(quantite);
        if (quantite <= 0) {
            return 0;
        }

        const stagesPresentes = Object.keys(stages);

        let total = 0;
        for (let i = 0; i < stagesPresentes.length; i++) {
            let valeur = Number(stages[stagesPresentes[i]].valeur);
            if (valeur > quantite) {
                valeur = quantite;
            }
            total = total + valeur;
        }

        return Math.round((total / (quantite * stagesPresentes.length)) * 100);
    }

    function buildStageHTML(record, etape) {
        const stage = record.stages[etape];
        return `
            <div class="stage-block">
                <p class="stage-title">${etape}</p>
                <input type="text" class="stage-desc" data-stage="${etape}"
                    placeholder="Description de l'avancement" value="${stage.description}">
                <label>Quantité complétée :
                    <input type="number" class="stage-input" data-stage="${etape}"
                        min="0" max="${record.quantite}" value="${stage.valeur}">
                </label>
            </div>
        `;
    }

    function render(records) {
        const oldCards = list.querySelectorAll('.new-request-card');
        for (let i = 0; i < oldCards.length; i++) {
            oldCards[i].remove();
        }

        if (records.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            const card = document.createElement('div');
            card.classList.add('new-request-card');
            card.dataset.id = record.id;

            const stagesDeLaReference = getStagesEnOrdre(record.stages);
            let stagesHTML = '';
            for (let j = 0; j < stagesDeLaReference.length; j++) {
                stagesHTML = stagesHTML + buildStageHTML(record, stagesDeLaReference[j]);
            }

            card.innerHTML = `
                <p><strong>Status :</strong>
                    <select class="status-select">
                        <option value="waiting">Waiting</option>
                        <option value="progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </p>
                <p><strong>Famille de carte :</strong> ${record.famille}</p>
                <p><strong>Référence :</strong> ${record.reference}</p>
                <p><strong>Quantité demandée :</strong> ${record.quantite}</p>
                <p><strong>Date de création :</strong> ${record.dateCreation}</p>
                <p><strong>Date limite de livraison :</strong> ${record.dateLimite}</p>

                <div class="progress-wrap">
                    <div class="progress-bar"><div class="progress-fill" style="width:${record.percent}%"></div></div>
                    <span class="progress-label">${record.percent}%</span>
                </div>

                ${stagesHTML}

                <div class="card-actions">
                    <button type="button" class="delete-button">Delete</button>
                </div>
            `;

            card.querySelector('.status-select').value = record.status;
            list.appendChild(card);
        }
    }

    // Remplace onSnapshot(Firestore) : rappelé à chaque modification locale.
    subscribe(function (records) {
        currentRecords = records;
        render(currentRecords);
    });

    /* ---------- Ajout d'une nouvelle requête ---------- */
    addButton.addEventListener('click', function (event) {
        event.preventDefault();

        const famille = familleSelect.value;
        const reference = carteRefSelect.value;
        const quantite = document.getElementById('quantite').value.trim();
        const dateCreation = document.getElementById('dateCreation').value;
        const dateLimite = document.getElementById('dateLimite').value;

        if (famille === '' || reference === '' || quantite === '' || dateCreation === '' || dateLimite === '') {
            alert('Merci de remplir tous les champs.');
            return;
        }

        const etapesApplicables = referenceStages[reference] || [];

        const stages = {};
        for (let i = 0; i < etapesApplicables.length; i++) {
            stages[etapesApplicables[i]] = { description: '', valeur: 0 };
        }

        const record = {
            status: 'waiting',
            famille: famille,
            reference: reference,
            quantite: quantite,
            dateCreation: dateCreation,
            dateLimite: dateLimite,
            stages: stages,
            percent: 0
        };

        addRecord(record);

        carteRefSelect.selectedIndex = 0;
        document.getElementById('quantite').value = '';
        document.getElementById('dateCreation').value = '';
        document.getElementById('dateLimite').value = '';
    });

    /* ---------- Clic sur Delete ---------- */
    list.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-button')) {
            const card = event.target.closest('.new-request-card');
            const id = card.dataset.id;
            deleteRecord(id);
        }
    });

    /* ---------- Changement de statut ---------- */
    list.addEventListener('change', function (event) {
        if (event.target.classList.contains('status-select')) {
            const card = event.target.closest('.new-request-card');
            const id = card.dataset.id;
            updateRecord(id, { status: event.target.value });
        }
    });

    /* ---------- Modification d'une étape : description ou quantité ---------- */
    list.addEventListener('input', function (event) {
        const etape = event.target.dataset.stage;
        if (!etape) {
            return;
        }

        const card = event.target.closest('.new-request-card');
        const id = card.dataset.id;

        const record = currentRecords.find(function (r) { return r.id === id; });
        if (!record) {
            return;
        }

        const updateData = {};

        if (event.target.classList.contains('stage-desc')) {
            updateData[`stages.${etape}.description`] = event.target.value;
        } else if (event.target.classList.contains('stage-input')) {
            const nouvellesStages = Object.assign({}, record.stages, {
                [etape]: Object.assign({}, record.stages[etape], { valeur: event.target.value })
            });
            const percent = computePercent(nouvellesStages, record.quantite);

            updateData[`stages.${etape}.valeur`] = event.target.value;
            updateData.percent = percent;

            const fill = card.querySelector('.progress-fill');
            const label = card.querySelector('.progress-label');
            if (fill && label) {
                fill.style.width = percent + '%';
                label.textContent = percent + '%';
            }
        }

        updateRecord(id, updateData);
    });

});
