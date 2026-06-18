(function() {
    'use strict';

    // ========================================
    // DOM REFS
    // ========================================
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileIcon = document.getElementById('fileIcon');
    const bucketInput = document.getElementById('bucketInput');
    const keyInput = document.getElementById('keyInput');
    const apiUrlInput = document.getElementById('apiUrlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const mockBtn = document.getElementById('mockBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    const emptyState = document.getElementById('emptyState');
    const dynamoPreview = document.getElementById('dynamoPreview');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    // Search refs
    const searchInput = document.getElementById('searchInput');
    const dateStart = document.getElementById('dateStart');
    const dateEnd = document.getElementById('dateEnd');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchResults = document.getElementById('searchResults');
    const pagination = document.getElementById('pagination');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const filterTabs = document.getElementById('filterTabs');

    // Result fields
    const resultTipo = document.getElementById('resultTipo');
    const resultId = document.getElementById('resultId');
    const resultData = document.getElementById('resultData');
    const resultLocal = document.getElementById('resultLocal');
    const resultValor = document.getElementById('resultValor');
    const resultEnvolvidos = document.getElementById('resultEnvolvidos');
    const resultResumo = document.getElementById('resultResumo');
    const resultProcessado = document.getElementById('resultProcessado');
    const resultArquivo = document.getElementById('resultArquivo');

    // Modal
    const detailModal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');

    // ========================================
    // STATE
    // ========================================
    let mockDatabase = [];
    let filteredData = [];
    let currentPage = 1;
    let pageSize = 5;
    let currentFilter = 'all';
    let currentResult = null;
    let selectedFile = null;

    // ========================================
    // TOAST SYSTEM
    // ========================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-triangle-exclamation',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <span class="toast-icon ${type}">
                <i class="fas ${icons[type] || icons.info}"></i>
            </span>
            <span class="toast-content">${message}</span>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // ========================================
    // FILE HANDLING
    // ========================================
    function handleFile(file) {
        const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(ext)) {
            showToast('Formato não suportado. Use PDF, JPG ou PNG.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast('Arquivo muito grande! Máximo 10 MB.', 'error');
            return;
        }

        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';

        const iconMap = {
            '.pdf': 'fa-file-pdf',
            '.jpg': 'fa-file-image',
            '.jpeg': 'fa-file-image',
            '.png': 'fa-file-image'
        };
        fileIcon.className = `fas ${iconMap[ext] || 'fa-file'}`;

        fileInfo.classList.add('show');
        keyInput.value = file.name;

        showToast(`Arquivo "${file.name}" carregado com sucesso!`, 'success');
    }

    // Upload events
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ========================================
    // GENERATE MOCK DATA
    // ========================================
    function generateMockData(count) {
        const tipos = ['Boletim de Ocorrência', 'Laudo Médico', 'Nota Fiscal', 'Documento de Identidade', 'Declaração'];
        const nomes = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Costa', 'Pedro Lima',
                       'Fernanda Souza', 'Roberto Almeida', 'Patrícia Rocha', 'Gustavo Pereira', 'Camila Nunes'];
        const locais = [
            'Av. Paulista, 1000 - São Paulo/SP',
            'Rua Augusta, 500 - São Paulo/SP',
            'Av. Brasil, 200 - Rio de Janeiro/RJ',
            'Rua dos Andradas, 1500 - Porto Alegre/RS',
            'Av. Getúlio Vargas, 300 - Belo Horizonte/MG'
        ];
        const resumos = [
            'Acidente de trânsito envolvendo dois veículos. Sem vítimas fatais.',
            'Paciente com fratura no braço esquerdo após queda.',
            'Serviços prestados no valor de R$ 12.500,00.',
            'Documento de identificação civil emitido em 15/03/2025.',
            'Ocorrência registrada na delegacia do bairro.',
            'Sinistro automotivo com colisão traseira. Veículo segurado.',
            'Atestado médico para afastamento de 15 dias.',
            'Nota fiscal de aquisição de equipamentos hospitalares.'
        ];

        mockDatabase = [];

        for (let i = 0; i < count; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const numEnvolvidos = Math.floor(Math.random() * 3) + 1;
            const envolvidos = [];
            const shuffled = [...nomes].sort(() => Math.random() - 0.5);
            for (let j = 0; j < numEnvolvidos; j++) {
                envolvidos.push(shuffled[j]);
            }

            const data = new Date();
            data.setDate(data.getDate() - Math.floor(Math.random() * 30));
            const dataStr = data.toLocaleDateString('pt-BR');

            const id = `sin-${String(i + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6)}`;

            mockDatabase.push({
                id: id,
                tipo_documento: tipo,
                resumo: resumos[Math.floor(Math.random() * resumos.length)],
                campos_extraidos: {
                    data: dataStr,
                    local: locais[Math.floor(Math.random() * locais.length)],
                    valor: `R$ ${(Math.random() * 25000 + 500).toFixed(2)}`,
                    envolvidos: envolvidos
                },
                processado_em: data.toISOString(),
                arquivo: {
                    nome_original: `documento_${i+1}.pdf`,
                    s3_key: `uploads/${id}.pdf`
                }
            });
        }

        mockDatabase.sort((a, b) => new Date(b.processado_em) - new Date(a.processado_em));
    }

    // ========================================
    // FILTER FUNCTIONS
    // ========================================
    function getFilterType(tipo) {
        const map = {
            'Boletim de Ocorrência': 'boletim',
            'Laudo Médico': 'laudo',
            'Nota Fiscal': 'fiscal'
        };
        return map[tipo] || 'outro';
    }

    function getTypeColor(tipo) {
        const map = {
            'Boletim de Ocorrência': '#1a4a8a',
            'Laudo Médico': '#d4893b',
            'Nota Fiscal': '#2d8f5c',
            'Documento de Identidade': '#6b4c9a',
            'Declaração': '#4a7c8a'
        };
        return map[tipo] || '#64748b';
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const startDate = dateStart.value;
        const endDate = dateEnd.value;

        filteredData = mockDatabase.filter(item => {
            if (currentFilter !== 'all') {
                const filterType = getFilterType(item.tipo_documento);
                if (filterType !== currentFilter) return false;
            }

            if (searchTerm) {
                const searchable = [
                    item.id.toLowerCase(),
                    item.tipo_documento.toLowerCase(),
                    item.resumo.toLowerCase(),
                    item.campos_extraidos.local.toLowerCase(),
                    ...item.campos_extraidos.envolvidos.map(n => n.toLowerCase())
                ].join(' ');

                if (!searchable.includes(searchTerm)) return false;
            }

            if (startDate) {
                const itemDate = new Date(item.processado_em).toISOString().split('T')[0];
                if (itemDate < startDate) return false;
            }
            if (endDate) {
                const itemDate = new Date(item.processado_em).toISOString().split('T')[0];
                if (itemDate > endDate) return false;
            }

            return true;
        });

        updateCounts();
        renderResults();
    }

    function updateCounts() {
        const counts = {
            all: mockDatabase.length,
            boletim: 0,
            laudo: 0,
            fiscal: 0,
            outro: 0
        };

        mockDatabase.forEach(item => {
            const type = getFilterType(item.tipo_documento);
            counts[type] = (counts[type] || 0) + 1;
        });

        document.getElementById('countAll').textContent = counts.all;
        document.getElementById('countBoletim').textContent = counts.boletim;
        document.getElementById('countLaudo').textContent = counts.laudo;
        document.getElementById('countFiscal').textContent = counts.fiscal;
        document.getElementById('countOutro').textContent = counts.outro;
    }

    // ========================================
    // GET SELECTED IDs
    // ========================================
    function getSelectedIds() {
        const checkboxes = document.querySelectorAll('.search-result-item .item-checkbox');
        const selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                selected.push(cb.dataset.id);
            }
        });
        return selected;
    }

    function updateSelectedCount() {
        const selectedIds = getSelectedIds();
        const count = selectedIds.length;
        const countEl = document.getElementById('selectedCount');
        const exportBtn = document.getElementById('exportSelectedBtn');

        if (count > 0) {
            countEl.style.display = 'inline-flex';
            countEl.textContent = `${count} selecionado${count > 1 ? 's' : ''}`;
            exportBtn.style.display = 'inline-flex';
        } else {
            countEl.style.display = 'none';
            exportBtn.style.display = 'none';
        }

        const checkboxes = document.querySelectorAll('.search-result-item .item-checkbox');
        const selectAll = document.getElementById('selectAllCheckbox');
        if (checkboxes.length > 0) {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            selectAll.checked = allChecked;
        }
    }

    function toggleSelectAll() {
        const selectAll = document.getElementById('selectAllCheckbox');
        const checkboxes = document.querySelectorAll('.search-result-item .item-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = selectAll.checked;
        });
        updateSelectedCount();
    }

    // ========================================
    // RENDER RESULTS
    // ========================================
    function renderResults() {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageData = filteredData.slice(start, end);

        searchResults.innerHTML = '';

        if (pageData.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                    Nenhum registro encontrado com os filtros aplicados
                </div>
            `;
            pagination.style.display = 'none';
            document.getElementById('selectedCount').style.display = 'none';
            document.getElementById('exportSelectedBtn').style.display = 'none';
            return;
        }

        pageData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex: 1;">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="item-checkbox" data-id="${item.id}">
                    </div>
                    <span class="id"><i class="fas fa-hashtag" style="color: var(--gray-400);"></i> ${item.id}</span>
                    <span class="type" style="background: ${getTypeColor(item.tipo_documento)};">
                        ${item.tipo_documento}
                    </span>
                    <span class="date"><i class="far fa-calendar-alt"></i> ${item.campos_extraidos.data}</span>
                    <span style="font-size: 12px; color: var(--gray-500); flex: 1; min-width: 100px;">
                        ${item.resumo.substring(0, 50)}${item.resumo.length > 50 ? '...' : ''}
                    </span>
                </div>
                <button class="btn btn-primary btn-sm view-btn" data-id="${item.id}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            `;
            searchResults.appendChild(div);

            const checkbox = div.querySelector('.item-checkbox');
            checkbox.addEventListener('change', updateSelectedCount);

            const viewBtn = div.querySelector('.view-btn');
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const record = mockDatabase.find(d => d.id === item.id);
                if (record) showDetailModal(record);
            });

            div.addEventListener('click', () => {
                const record = mockDatabase.find(d => d.id === item.id);
                if (record) showDetailModal(record);
            });
        });

        const totalPages = Math.ceil(filteredData.length / pageSize);
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages || 1;
        prevPage.disabled = currentPage <= 1;
        nextPage.disabled = currentPage >= totalPages;
        pagination.style.display = totalPages > 1 ? 'flex' : 'none';

        updateSelectedCount();
    }

    // ========================================
    // CHANGE PAGE
    // ========================================
    function changePage(delta) {
        const totalPages = Math.ceil(filteredData.length / pageSize);
        const newPage = currentPage + delta;
        if (newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        renderResults();
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ========================================
    // HANDLE FILTER CLICK
    // ========================================
    function handleFilterClick(e) {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        currentFilter = tab.dataset.filter;
        currentPage = 1;
        applyFilters();
    }

    // ========================================
    // SHOW DETAIL MODAL
    // ========================================
    function showDetailModal(item) {
        const modal = document.getElementById('detailModal');
        const body = document.getElementById('modalBody');

        body.innerHTML = `
            <div class="result-item">
                <span class="label"><i class="fas fa-tag"></i> Tipo</span>
                <span class="value">
                    <span class="tag" style="background: ${getTypeColor(item.tipo_documento)}; color: white; padding: 4px 14px; border-radius: 100px; font-size: 14px;">
                        ${item.tipo_documento}
                    </span>
                </span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-hashtag"></i> ID</span>
                <span class="value" style="font-family: monospace; font-size: 14px;">${item.id}</span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-calendar"></i> Data do Evento</span>
                <span class="value">${item.campos_extraidos.data}</span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-location-dot"></i> Local</span>
                <span class="value">${item.campos_extraidos.local}</span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-money-bill-wave"></i> Valor Estimado</span>
                <span class="value" style="font-weight: 600; color: var(--primary);">${item.campos_extraidos.valor}</span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-users"></i> Envolvidos</span>
                <span class="value">
                    ${item.campos_extraidos.envolvidos.map(n =>
                        `<span class="envolvido-tag">${n}</span>`
                    ).join('')}
                </span>
            </div>
            <div class="result-item" style="flex-direction: column; align-items: stretch; gap: 8px; padding: 12px 0;">
                <span class="label"><i class="fas fa-file-lines"></i> Resumo</span>
                <span class="value" style="text-align: left; font-size: 14px; line-height: 1.6; background: var(--gray-50); padding: 12px 16px; border-radius: var(--radius-sm);">
                    ${item.resumo}
                </span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-clock"></i> Processado em</span>
                <span class="value" style="font-size: 13px; color: var(--gray-500);">
                    ${new Date(item.processado_em).toLocaleString('pt-BR')}
                </span>
            </div>
            <div class="result-item">
                <span class="label"><i class="fas fa-file"></i> Arquivo</span>
                <span class="value" style="font-size: 13px; color: var(--gray-500);">${item.arquivo.nome_original}</span>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-outline" onclick="copyToClipboard('${JSON.stringify(item).replace(/'/g, "\\'")}')">
                    <i class="fas fa-copy"></i> Copiar JSON
                </button>
                <button class="btn btn-export" onclick="exportSingleCSV('${item.id}')">
                    <i class="fas fa-file-excel"></i> Exportar CSV
                </button>
                <button class="btn btn-outline" onclick="closeModal()">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
            <div style="margin-top: 16px;">
                <div class="dynamo-preview" style="max-height: 150px;">
                    ${syntaxHighlight(JSON.stringify(item, null, 2))}
                </div>
            </div>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // ========================================
    // CLOSE MODAL
    // ========================================
    window.closeModal = function() {
        document.getElementById('detailModal').classList.remove('show');
        document.body.style.overflow = '';
    };

    // ========================================
    // COPY TO CLIPBOARD
    // ========================================
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 JSON copiado para a área de transferência!', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('📋 JSON copiado!', 'success');
        });
    };

    // ========================================
    // SYNTAX HIGHLIGHT
    // ========================================
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) cls = 'key';
                else cls = 'string';
            } else if (/true|false/.test(match)) cls = 'boolean';
            else if (/null/.test(match)) cls = 'null';
            return `<span class="${cls}">${match}</span>`;
        });
    }

    // ========================================
    // EXPORT FUNCTIONS
    // ========================================

    function convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = [
            'ID',
            'Tipo Documento',
            'Data',
            'Local',
            'Valor',
            'Envolvidos',
            'Resumo',
            'Processado em',
            'Arquivo'
        ];

        const rows = data.map(item => {
            const envolvidos = item.campos_extraidos?.envolvidos || [];
            return [
                item.id || '',
                item.tipo_documento || '',
                item.campos_extraidos?.data || '',
                item.campos_extraidos?.local || '',
                item.campos_extraidos?.valor || '',
                envolvidos.join('; '),
                item.resumo || '',
                item.processado_em ? new Date(item.processado_em).toLocaleString('pt-BR') : '',
                item.arquivo?.nome_original || ''
            ];
        });

        const escapeCSV = (str) => {
            if (str === null || str === undefined) return '';
            const string = String(str);
            if (string.includes(',') || string.includes('"') || string.includes('\n')) {
                return `"${string.replace(/"/g, '""')}"`;
            }
            return string;
        };

        const csvRows = [
            headers.map(h => escapeCSV(h)).join(','),
            ...rows.map(row => row.map(cell => escapeCSV(cell)).join(','))
        ];

        return csvRows.join('\n');
    }

    function downloadCSV(csvContent, filename = 'sinistros') {
        const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function exportCurrentCSV() {
        if (!currentResult) {
            showToast('Nenhum resultado para exportar.', 'warning');
            return;
        }
        const data = [currentResult];
        const csv = convertToCSV(data);
        downloadCSV(csv, `sinistro_${currentResult.id}`);
        showToast('📊 CSV exportado com sucesso!', 'success');
    }

    window.exportSingleCSV = function(id) {
        const item = mockDatabase.find(d => d.id === id);
        if (!item) {
            showToast('Registro não encontrado.', 'error');
            return;
        }
        const data = [item];
        const csv = convertToCSV(data);
        downloadCSV(csv, `sinistro_${id}`);
        showToast('📊 CSV exportado com sucesso!', 'success');
    };

    function exportAllCSV() {
        if (mockDatabase.length === 0) {
            showToast('Nenhum registro para exportar.', 'warning');
            return;
        }
        const csv = convertToCSV(mockDatabase);
        downloadCSV(csv, 'todos_sinistros');
        showToast(`📊 ${mockDatabase.length} registros exportados com sucesso!`, 'success');
    }

    function exportSelectedCSV() {
        const selectedIds = getSelectedIds();
        if (selectedIds.length === 0) {
            showToast('Selecione pelo menos um documento.', 'warning');
            return;
        }
        const selectedData = mockDatabase.filter(item => selectedIds.includes(item.id));
        const csv = convertToCSV(selectedData);
        downloadCSV(csv, 'sinistros_selecionados');
        showToast(`📊 ${selectedData.length} registros selecionados exportados!`, 'success');
    }

    // ========================================
    // PRINT FUNCTION
    // ========================================

    function printReport() {
        if (mockDatabase.length === 0) {
            showToast('Nenhum registro para imprimir.', 'warning');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) {
            showToast('Por favor, permita pop-ups para imprimir.', 'warning');
            return;
        }

        const date = new Date().toLocaleDateString('pt-BR');
        const time = new Date().toLocaleTimeString('pt-BR');

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Relatório de Sinistros - DocuSmart</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', Arial, sans-serif; padding: 40px; background: white; color: #1e293b; }
                    .header { border-bottom: 3px solid #0a2a5c; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { color: #0a2a5c; font-size: 28px; }
                    .header .sub { color: #64748b; font-size: 14px; margin-top: 4px; }
                    .header .meta { color: #64748b; font-size: 13px; margin-top: 8px; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    th { background: #0a2a5c; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
                    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
                    tr:hover { background: #f8fafc; }
                    .type-badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
                    .summary { background: #f8fafc; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 30px; flex-wrap: wrap; }
                    .summary-item { display: flex; align-items: center; gap: 8px; }
                    .summary-item .label { color: #64748b; font-weight: 500; }
                    .summary-item .value { font-weight: 700; color: #0a2a5c; font-size: 18px; }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📄 DocuSmart Seguros</h1>
                    <div class="sub">Relatório de Sinistros</div>
                    <div class="meta">Gerado em: ${date} às ${time} · Total de registros: ${mockDatabase.length}</div>
                </div>

                <div class="summary">
                    <div class="summary-item">
                        <span class="label">Total:</span>
                        <span class="value">${mockDatabase.length}</span>
                    </div>
                    ${(() => {
                        const tipos = {};
                        mockDatabase.forEach(item => {
                            const tipo = item.tipo_documento || 'Outro';
                            tipos[tipo] = (tipos[tipo] || 0) + 1;
                        });
                        return Object.entries(tipos).map(([tipo, count]) => `
                            <div class="summary-item">
                                <span class="label">${tipo}:</span>
                                <span class="value">${count}</span>
                            </div>
                        `).join('');
                    })()}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Valor</th>
                            <th>Envolvidos</th>
                            <th>Resumo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockDatabase.map(item => `
                            <tr>
                                <td><code style="font-size: 12px;">${item.id}</code></td>
                                <td><span class="type-badge" style="background: ${getTypeColor(item.tipo_documento)}; color: white;">${item.tipo_documento}</span></td>
                                <td>${item.campos_extraidos?.data || '-'}</td>
                                <td>${item.campos_extraidos?.local || '-'}</td>
                                <td><strong>${item.campos_extraidos?.valor || '-'}</strong></td>
                                <td>${(item.campos_extraidos?.envolvidos || []).join('; ')}</td>
                                <td style="max-width: 250px;">${item.resumo || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>DocuSmart Seguros · Análise Inteligente de Sinistros · AWS Serverless</p>
                    <p style="margin-top: 4px;">Documento gerado automaticamente pelo sistema</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    };
                <\/script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }

    // ========================================
    // ANALYZE / MOCK
    // ========================================
    function setStatus(text, type = 'success') {
        statusText.textContent = text;
        statusDot.className = 'status-dot';
        if (type === 'warning') statusDot.classList.add('warning');
        else if (type === 'error') statusDot.style.background = 'var(--danger)';
        else statusDot.style.background = '#48bb78';
    }

    function generateMockResult(bucket, key, filename) {
        const docTypes = ['Boletim de Ocorrência', 'Laudo Médico', 'Nota Fiscal', 'Documento de Identidade'];
        const tipo = docTypes[Math.floor(Math.random() * docTypes.length)];
        const nomes = ['João Silva', 'Maria Oliveira', 'Carlos Santos', 'Ana Costa', 'Pedro Lima'];
        const envolvidos = [];
        const numEnvolvidos = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numEnvolvidos; i++) {
            envolvidos.push(nomes[Math.floor(Math.random() * nomes.length)]);
        }
        const locais = [
            'Av. Paulista, 1000 - São Paulo/SP',
            'Rua Augusta, 500 - São Paulo/SP',
            'Av. Brasil, 200 - Rio de Janeiro/RJ',
            'Rua dos Andradas, 1500 - Porto Alegre/RS'
        ];
        const data = new Date();
        const dataStr = data.toLocaleDateString('pt-BR');
        const resumos = [
            `Acidente de trânsito ocorrido em ${locais[0]} no dia ${dataStr}. Envolvidos: ${envolvidos.join(' e ')}. Sem vítimas fatais.`,
            `Incidente registrado em ${locais[1]} envolvendo ${envolvidos.length} pessoas. Documento classificado como "${tipo}".`,
            `Ocorrência em ${locais[2]} no dia ${dataStr}. ${envolvidos[0]} e ${envolvidos[1]} envolvidos no incidente.`,
            `Sinistro reportado em ${locais[3]}. ${envolvidos.join(', ')}. Valor estimado do prejuízo: R$ ${(Math.random() * 15000 + 500).toFixed(2)}`
        ];
        const id = 'sin-' + Math.random().toString(36).substring(2, 10);

        return {
            id: id,
            tipo_documento: tipo,
            resumo: resumos[Math.floor(Math.random() * resumos.length)],
            campos_extraidos: {
                data: dataStr,
                local: locais[Math.floor(Math.random() * locais.length)],
                valor: `R$ ${(Math.random() * 15000 + 500).toFixed(2)}`,
                envolvidos: envolvidos
            },
            processado_em: new Date().toISOString(),
            arquivo: {
                nome_original: filename || key || 'documento.pdf',
                s3_key: key || `uploads/${Date.now()}.pdf`
            }
        };
    }

    function displayResult(data) {
        const tipo = data.tipo_documento || 'Outro';
        const tagClass = {
            'Boletim de Ocorrência': 'tag-boletim',
            'Laudo Médico': 'tag-laudo',
            'Nota Fiscal': 'tag-fiscal'
        }[tipo] || 'tag-outro';

        resultTipo.textContent = tipo;
        resultTipo.className = `tag ${tagClass}`;
        resultId.textContent = data.id || '-';
        resultData.textContent = data.campos_extraidos?.data || '-';
        resultLocal.textContent = data.campos_extraidos?.local || '-';
        resultValor.textContent = data.campos_extraidos?.valor || '-';

        const envolvidos = data.campos_extraidos?.envolvidos || [];
        if (envolvidos.length > 0) {
            resultEnvolvidos.innerHTML = envolvidos.map(n =>
                `<span class="envolvido-tag">${n}</span>`
            ).join('');
        } else {
            resultEnvolvidos.textContent = '-';
        }

        resultResumo.textContent = data.resumo || 'Sem resumo disponível';
        resultProcessado.textContent = data.processado_em ?
            new Date(data.processado_em).toLocaleString('pt-BR') :
            '-';
        resultArquivo.textContent = data.arquivo?.nome_original || '-';

        const dynamoData = {
            id: data.id,
            tipo_documento: data.tipo_documento,
            resumo: data.resumo,
            campos_extraidos: data.campos_extraidos,
            processado_em: data.processado_em,
            arquivo: data.arquivo
        };

        dynamoPreview.innerHTML = syntaxHighlight(JSON.stringify(dynamoData, null, 2));

        if (data.id) {
            const exists = mockDatabase.some(d => d.id === data.id);
            if (!exists) {
                mockDatabase.unshift(data);
                applyFilters();
            }
        }

        resultsPanel.classList.add('show');
        emptyState.style.display = 'none';
        currentResult = data;

        showToast('✅ Análise concluída com sucesso!', 'success');
    }

    function simulateAnalysis() {
        const bucket = bucketInput.value.trim() || 'docusmart-sinistros';
        const key = keyInput.value.trim() || (selectedFile ? selectedFile.name : 'documento.pdf');
        const filename = selectedFile ? selectedFile.name : key;

        setStatus('Simulando...', 'warning');
        showToast('🔬 Simulando análise com dados mock', 'info');

        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('loading');

        setTimeout(() => {
            const mockData = generateMockResult(bucket, key, filename);
            displayResult(mockData);
            setStatus('Simulação concluída', 'success');
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('loading');
            showToast('✅ Simulação finalizada!', 'success');
        }, 1500);
    }

    function clearAll() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.classList.remove('show');
        keyInput.value = '';
        resultsPanel.classList.remove('show');
        emptyState.style.display = 'block';
        dynamoPreview.innerHTML = '<span class="empty">// aguardando análise</span>';
        currentResult = null;

        const resultFields = ['resultTipo', 'resultId', 'resultData', 'resultLocal',
            'resultValor', 'resultEnvolvidos', 'resultResumo', 'resultProcessado', 'resultArquivo'];
        resultFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '-';
        });

        setStatus('Pronto', 'success');
        showToast('🧹 Área limpa', 'info');
    }

    function copyResult() {
        if (!currentResult) {
            showToast('Nenhum resultado para copiar.', 'warning');
            return;
        }
        const json = JSON.stringify(currentResult, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            showToast('📋 JSON copiado para a área de transferência!', 'success');
        }).catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = json;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('📋 JSON copiado!', 'success');
        });
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    analyzeBtn.addEventListener('click', simulateAnalysis);
    clearBtn.addEventListener('click', clearAll);
    mockBtn.addEventListener('click', simulateAnalysis);
    document.getElementById('copyResultBtn').addEventListener('click', copyResult);
    document.getElementById('exportCurrentBtn').addEventListener('click', exportCurrentCSV);
    document.getElementById('exportAllBtn').addEventListener('click', exportAllCSV);
    document.getElementById('exportSelectedBtn').addEventListener('click', exportSelectedCSV);
    document.getElementById('printAllBtn').addEventListener('click', printReport);
    document.getElementById('selectAllCheckbox').addEventListener('change', toggleSelectAll);

    // Search events
    filterTabs.addEventListener('click', handleFilterClick);
    searchBtn.addEventListener('click', () => { currentPage = 1; applyFilters(); });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        dateStart.value = '';
        dateEnd.value = '';
        currentPage = 1;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');
        currentFilter = 'all';
        applyFilters();
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { currentPage = 1; applyFilters(); }
    });
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));

    // Modal events
    modalClose.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // ========================================
    // INIT
    // ========================================
    generateMockData(25);
    applyFilters();
    setStatus('Pronto', 'success');
    showToast('🚀 DocuSmart Seguros carregado. Faça upload ou busque registros.', 'info');

    console.log(`📊 Sistema inicializado com ${mockDatabase.length} registros`);
    console.log('🔍 Sistema de busca avançado carregado');
    console.log('📊 Exportação para CSV disponível');

})();