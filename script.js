import { subscribe } from "./storage.js";

document.addEventListener('DOMContentLoaded', function () {

    const list = document.getElementById('newrequest');
    const emptyState = document.getElementById('emptyState');
    const searchRef = document.getElementById('searchRef');

    function statusLabel(status) {
        if (status === 'waiting') return 'Waiting';
        if (status === 'In progress') return 'In Progress';
        if (status === 'completed') return 'Completed';
        return status;
    }

    const ordreEtapes = ['TF', 'Etiquetage', 'Assemblage', 'Gluing', 'Emballage'];

    function getStagesEnOrdre(stages) {
        if (!stages) {
            return [];
        }
        return ordreEtapes.filter(function (etape) {
            return Object.prototype.hasOwnProperty.call(stages, etape);
        });
    }

    function buildStageHTML(record, etape) {
        const stage = record.stages[etape];
        return `
            <div class="stage-block">
                <p class="stage-title">${etape}</p>
                <p><strong>Description :</strong> ${stage.description || '—'}</p>
                <p><strong>Quantité complétée :</strong> ${stage.valeur}</p>
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
            card.dataset.ref = record.reference.toLowerCase();

            const stagesDeLaReference = getStagesEnOrdre(record.stages);
            let stagesHTML = '';
            for (let j = 0; j < stagesDeLaReference.length; j++) {
                stagesHTML = stagesHTML + buildStageHTML(record, stagesDeLaReference[j]);
            }

            card.innerHTML = `
                <p><strong>Status :</strong> ${statusLabel(record.status)}</p>
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
            `;

            list.appendChild(card);
        }

        applyFilter();
    }

    function applyFilter() {
        const term = searchRef.value.trim().toLowerCase();
        const cards = list.querySelectorAll('.new-request-card');
        let visibleCount = 0;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.dataset.ref.indexOf(term) !== -1) {
                card.style.display = '';
                visibleCount = visibleCount + 1;
            } else {
                card.style.display = 'none';
            }
        }

        if (cards.length === 0) {
            emptyState.style.display = 'block';
            emptyState.textContent = "Aucune requête pour l'instant.";
        } else if (visibleCount === 0) {
            emptyState.style.display = 'block';
            emptyState.textContent = 'Aucune requête ne correspond à cette recherche.';
        } else {
            emptyState.style.display = 'none';
        }
    }

    searchRef.addEventListener('input', applyFilter);

    // Remplace onSnapshot(Firestore) : subscribe() rappelle cette fonction
    // à chaque modification des données locales.
    subscribe(function (records) {
        render(records);
    });

});
