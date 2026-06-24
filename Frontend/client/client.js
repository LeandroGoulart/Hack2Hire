(function () {
    'use strict';

    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadedDocuments = document.getElementById('uploadedDocuments');
    const uploadedDocumentsEmpty = document.getElementById('uploadedDocumentsEmpty');
    const uploadedDocumentsList = document.getElementById('uploadedDocumentsList');
    const sendDocumentsBtn = document.getElementById('analyzeBtn');
    const sendDocumentsText = sendDocumentsBtn.querySelector('.btn-text');
    const clearBtn = document.getElementById('clearBtn');
    const mockBtn = document.getElementById('mockBtn');
    const startServiceBtn = document.getElementById('startServiceBtn');
    const missingDocuments = document.getElementById('missingDocuments');
    const missingDocumentsText = document.getElementById('missingDocumentsText');
    const serviceReady = document.getElementById('serviceReady');
    const serviceReadyTitle = document.getElementById('serviceReadyTitle');
    const serviceReadyText = document.getElementById('serviceReadyText');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressSummary = document.getElementById('progressSummary');
    const progressBar = document.getElementById('progressBar');
    const progressBarFill = document.getElementById('progressBarFill');
    const sentCount = document.getElementById('sentCount');
    const pendingCount = document.getElementById('pendingCount');
    const addedCount = document.getElementById('addedCount');
    const chatbotSection = document.getElementById('chatbot-section');

    const requiredTypes = ['boletim', 'laudo', 'fiscal', 'outro'];
    const documentTypes = {
        boletim: {
            label: 'Boletim de Ocorrência',
            description: 'Registro oficial do ocorrido.'
        },
        laudo: {
            label: 'Laudo Médico',
            description: 'Necessário quando houver atendimento ou lesão.'
        },
        fiscal: {
            label: 'Nota Fiscal',
            description: 'Comprovante dos serviços ou despesas informadas.'
        },
        outro: {
            label: 'Outros documentos',
            description: 'Fotos, declarações e comprovantes complementares.'
        }
    };
    const statusConfig = {
        sent: { label: 'Enviado', icon: 'fa-check', className: 'sent' },
        analyzing: { label: 'Em análise', icon: 'fa-spinner fa-spin', className: 'analyzing' },
        rejected: { label: 'Requer correção', icon: 'fa-xmark', className: 'rejected' }
    };

    let documents = [];
    let submissionConfirmed = false;

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-triangle-exclamation',
            info: 'fa-info-circle'
        };

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon ${type}"><i class="fas ${icons[type] || icons.info}"></i></span>
            <span class="toast-content">${message}</span>
            <button class="toast-close" type="button" aria-label="Fechar aviso">
                <i class="fas fa-times"></i>
            </button>
        `;
        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('hide');
            window.setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    function setStatus(text, type = 'success') {
        statusText.textContent = text;
        statusDot.className = 'status-dot';
        statusDot.style.background = type === 'warning'
            ? 'var(--warning)'
            : type === 'error'
                ? 'var(--danger)'
                : '#48bb78';
    }

    function normalizeFileName(name) {
        return name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function detectDocumentType(name) {
        const normalized = normalizeFileName(name);
        if (/(boletim|ocorrencia|(^|[-_\s])bo([-_\s.]|$))/.test(normalized)) return 'boletim';
        if (/(laudo|medico|atestado)/.test(normalized)) return 'laudo';
        if (/(nota.?fiscal|nf[-_\s]|recibo|fatura)/.test(normalized)) return 'fiscal';
        return 'outro';
    }

    function getValidDocument(type) {
        return documents.find(document => document.type === type && document.status !== 'rejected');
    }

    function getMissingTypes() {
        return requiredTypes.filter(type => !getValidDocument(type));
    }

    function getCompletedTypes() {
        return requiredTypes.filter(type => getValidDocument(type));
    }

    function formatFileSize(size) {
        if (!size) return 'Arquivo de demonstração';
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function getFileIcon(name) {
        return name.toLowerCase().endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-image';
    }

    function createDocument(file) {
        const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
        const type = detectDocumentType(file.name);
        let status = 'sent';
        let reason = '';

        if (!['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
            status = 'rejected';
            reason = 'Formato inválido. Envie um arquivo PDF, JPG ou PNG.';
        } else if (file.size > 10 * 1024 * 1024) {
            status = 'rejected';
            reason = 'Arquivo maior que 10 MB.';
        } else if (file.size === 0) {
            status = 'rejected';
            reason = 'Arquivo vazio ou ilegível.';
        }

        return {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            size: file.size,
            type,
            status,
            reason,
            uploadedAt: new Date()
        };
    }

    function addFiles(fileList) {
        let added = 0;
        let rejected = 0;

        Array.from(fileList).forEach(file => {
            if (documents.some(document => document.name === file.name && document.size === file.size)) {
                showToast(`O arquivo "${file.name}" já foi adicionado.`, 'warning');
                return;
            }

            const document = createDocument(file);
            documents.push(document);
            added += 1;
            if (document.status === 'rejected') rejected += 1;
        });

        if (added > 0) {
            submissionConfirmed = false;
            setStatus(rejected ? 'Documento requer correção' : 'Documento recebido', rejected ? 'error' : 'success');
            showToast(
                rejected
                    ? `${added} arquivo${added > 1 ? 's processados' : ' processado'}; ${rejected} requer${rejected > 1 ? 'em' : ''} correção.`
                    : `${added} documento${added > 1 ? 's enviados' : ' enviado'} com sucesso.`,
                rejected ? 'warning' : 'success'
            );
            render();
        }
        fileInput.value = '';
    }

    function removeDocument(id) {
        documents = documents.filter(document => document.id !== id);
        submissionConfirmed = false;
        setStatus(documents.length ? 'Documentação atualizada' : 'Pronto');
        render();
    }

    function renderProgress() {
        const completed = getCompletedTypes().length;
        const pending = requiredTypes.length - completed;
        const percentage = Math.round((completed / requiredTypes.length) * 100);

        progressPercentage.textContent = `${percentage}% concluído`;
        progressSummary.textContent = `${completed} de ${requiredTypes.length} documentos enviados`;
        progressBar.setAttribute('aria-valuenow', String(percentage));
        progressBarFill.style.width = `${percentage}%`;
        sentCount.textContent = completed;
        pendingCount.textContent = pending;
        document.querySelector('.document-progress').classList.toggle('complete', percentage === 100);
    }

    function renderRequirements() {
        document.querySelectorAll('[data-requirement]').forEach(item => {
            const type = item.dataset.requirement;
            const document = getValidDocument(type);
            const rejectedDocument = documents.find(entry => entry.type === type && entry.status === 'rejected');
            const status = item.querySelector('.requirement-status');

            item.hidden = Boolean(document);
            item.className = 'requirement-item';
            if (document) {
                return;
            }

            if (rejectedDocument) {
                item.classList.add('rejected');
                status.className = 'requirement-status rejected';
                status.innerHTML = '<i class="fas fa-xmark"></i> Requer correção';
                return;
            }

            status.className = 'requirement-status';
            status.innerHTML = '<i class="fas fa-clock"></i> Pendente';
        });
    }

    function renderUploadedDocuments() {
        uploadedDocumentsEmpty.hidden = documents.length > 0;
        addedCount.textContent = documents.length;
        uploadedDocumentsList.innerHTML = documents.map(document => {
            const config = statusConfig[document.status];
            const type = documentTypes[document.type];
            const safeName = escapeHtml(document.name);
            return `
                <article class="uploaded-document ${config.className}">
                    <span class="uploaded-document-check"><i class="fas ${config.icon}"></i></span>
                    <span class="uploaded-document-icon"><i class="fas ${getFileIcon(document.name)}"></i></span>
                    <span class="uploaded-document-copy">
                        <strong>${type.label}</strong>
                        <small class="uploaded-file-name">${safeName} · ${formatFileSize(document.size)}</small>
                        <small>${type.description}</small>
                        <time datetime="${document.uploadedAt.toISOString()}">Enviado em: ${formatDateTime(document.uploadedAt)}</time>
                        ${document.reason ? `<span class="document-error"><i class="fas fa-circle-exclamation"></i> ${document.reason}</span>` : ''}
                    </span>
                    <span class="uploaded-document-state ${config.className}">
                        <i class="fas ${config.icon}"></i> ${config.label}
                    </span>
                    <button class="uploaded-document-remove" type="button" data-remove-document="${document.id}" aria-label="Remover ${safeName}">
                        <i class="fas fa-times"></i>
                    </button>
                </article>
            `;
        }).join('');

        uploadedDocumentsList.querySelectorAll('[data-remove-document]').forEach(button => {
            button.addEventListener('click', () => removeDocument(button.dataset.removeDocument));
        });
    }

    function renderCompletion() {
        const missing = getMissingTypes();
        const allComplete = missing.length === 0;
        const hasValidDocuments = getCompletedTypes().length > 0;
        const hasAnalyzing = documents.some(document => document.status === 'analyzing');

        missingDocuments.hidden = allComplete;
        serviceReady.hidden = !allComplete;
        chatbotSection.hidden = !allComplete;
        missingDocumentsText.textContent = missing.map(type => documentTypes[type].label).join(', ') + '.';
        serviceReadyTitle.textContent = submissionConfirmed
            ? 'Protocolo SIN-2026-000145 criado com sucesso.'
            : 'Todos os documentos necessários foram adicionados.';
        serviceReadyText.textContent = submissionConfirmed
            ? 'Documentação recebida e aguardando análise automática.'
            : 'Clique em Enviar documentos para concluir a solicitação.';

        sendDocumentsBtn.disabled = !hasValidDocuments || submissionConfirmed || hasAnalyzing;
        sendDocumentsText.innerHTML = submissionConfirmed
            ? '<i class="fas fa-check"></i> Documentos enviados'
            : '<i class="fas fa-paper-plane"></i> Enviar documentos';
        startServiceBtn.disabled = !allComplete || !submissionConfirmed || hasAnalyzing;
        uploadZone.classList.toggle('complete', allComplete);
    }

    function render() {
        renderProgress();
        renderRequirements();
        renderUploadedDocuments();
        renderCompletion();
    }

    function sendDocuments() {
        const validDocuments = documents.filter(document => document.status !== 'rejected');
        if (validDocuments.length === 0 || submissionConfirmed) return;

        documents = documents.map(document => (
            document.status === 'rejected'
                ? document
                : { ...document, status: 'analyzing' }
        ));
        sendDocumentsBtn.classList.add('loading');
        setStatus('Documentos em análise...', 'warning');
        render();

        window.setTimeout(() => {
            documents = documents.map(document => (
                document.status === 'analyzing'
                    ? { ...document, status: 'sent' }
                    : document
            ));
            submissionConfirmed = true;
            sendDocumentsBtn.classList.remove('loading');
            setStatus('Documentos enviados');
            render();

            if (getMissingTypes().length === 0) {
                showToast('Todos os documentos necessários foram enviados com sucesso.');
                window.setTimeout(() => openProtocolAssistant(), 450);
            } else {
                showToast('Envio concluído. Confira os documentos que ainda estão pendentes.', 'info');
            }
        }, 1100);
    }

    function loadTestDocuments() {
        const now = new Date();
        documents = [
            { id: 'mock-boletim', name: 'boletim_ocorrencia.pdf', size: 418000, type: 'boletim', status: 'sent', reason: '', uploadedAt: now },
            { id: 'mock-laudo', name: 'laudo_medico.pdf', size: 735000, type: 'laudo', status: 'sent', reason: '', uploadedAt: now },
            { id: 'mock-fiscal', name: 'nota_fiscal.pdf', size: 286000, type: 'fiscal', status: 'sent', reason: '', uploadedAt: now },
            { id: 'mock-outro', name: 'fotos_do_sinistro.jpg', size: 924000, type: 'outro', status: 'sent', reason: '', uploadedAt: now }
        ];
        submissionConfirmed = false;
        setStatus('Documentos de teste adicionados');
        showToast('Documentos de demonstração adicionados.', 'info');
        render();
    }

    function clearAll() {
        documents = [];
        submissionConfirmed = false;
        fileInput.value = '';
        sendDocumentsBtn.classList.remove('loading');
        setStatus('Pronto');
        render();
        showToast('Todos os documentos foram removidos.', 'info');
    }

    function startService() {
        if (startServiceBtn.disabled) return;
        setStatus('Atendimento iniciado');
        openProtocolAssistant();
    }

    function buildProtocolContext() {
        const acceptedDocuments = documents.filter(document => document.status === 'sent');
        const rejectedDocuments = documents.filter(document => document.status === 'rejected');
        const pendingTypes = getMissingTypes();

        return {
            source: 'lambda-dynamodb',
            customer: {
                name: 'Gustavo'
            },
            protocol: {
                id: 'SIN-2026-000145',
                status: pendingTypes.length
                    ? 'Documentação parcial. Aguardando documentos pendentes.'
                    : 'Documentação recebida e aguardando análise automática.',
                analysisCompleted: false,
                estimatedDeadline: 'Até 48 horas úteis'
            },
            event: {
                date: '24/06/2026',
                location: 'Múltiplos locais',
                estimatedValue: 'R$ 309.928,85'
            },
            documents: {
                receivedCount: acceptedDocuments.length,
                received: acceptedDocuments.map(document => ({
                    name: document.name,
                    type: document.type,
                    label: documentTypes[document.type].label,
                    status: document.status,
                    uploadedAt: document.uploadedAt.toISOString()
                })),
                pending: pendingTypes.map(type => documentTypes[type].label),
                rejected: rejectedDocuments.map(document => ({
                    name: document.name,
                    label: documentTypes[document.type].label,
                    reason: document.reason
                }))
            },
            extractedData: {
                involvedPeople: [
                    'Gustavo Pereira',
                    'Patrícia Rocha',
                    'Roberto Almeida',
                    'Ana Costa',
                    'Carlos Santos',
                    'João Silva'
                ],
                inconsistencies: rejectedDocuments.map(document => document.reason)
            },
            nextActions: pendingTypes.length
                ? ['Enviar os documentos pendentes', 'Corrigir arquivos rejeitados']
                : ['Aguardar a análise automática', 'Acompanhar o status do protocolo']
        };
    }

    function openProtocolAssistant() {
        window.dispatchEvent(new CustomEvent('docsmart:start-service', {
            detail: {
                protocol: buildProtocolContext()
            }
        }));
    }

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', event => {
        event.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', event => {
        event.preventDefault();
        uploadZone.classList.remove('dragover');
        addFiles(event.dataTransfer.files);
    });
    fileInput.addEventListener('change', event => addFiles(event.target.files));
    sendDocumentsBtn.addEventListener('click', sendDocuments);
    clearBtn.addEventListener('click', clearAll);
    mockBtn.addEventListener('click', loadTestDocuments);
    startServiceBtn.addEventListener('click', startService);

    render();
    setStatus('Pronto');
}());
