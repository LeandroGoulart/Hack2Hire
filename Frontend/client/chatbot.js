(function () {
    'use strict';

    let protocolContext = null;

    const quickActions = [
        { label: 'Status do protocolo', message: 'Como está meu protocolo?' },
        { label: 'Documentos enviados', message: 'Quais documentos enviei?' },
        { label: 'Pendências', message: 'Está faltando alguma coisa?' },
        { label: 'Resumo', message: 'Me dê um resumo.' }
    ];

    function createChatPanel() {
        const panel = document.createElement('section');
        panel.className = 'client-chat';
        panel.id = 'clientChat';
        panel.setAttribute('aria-label', 'Atendimento DocuSmart');
        panel.innerHTML = `
            <header class="client-chat-header">
                <div>
                    <strong><i class="fas fa-comments"></i> Assistente do protocolo</strong>
                    <small><span></span> Contexto atualizado pela Lambda</small>
                </div>
                <button type="button" data-close-chat aria-label="Fechar atendimento">
                    <i class="fas fa-times"></i>
                </button>
            </header>
            <div class="client-chat-context" data-chat-context></div>
            <div class="client-chat-messages" data-chat-messages></div>
            <div class="client-chat-actions" data-chat-actions></div>
            <form class="client-chat-form" data-chat-form>
                <input type="text" data-chat-input placeholder="Pergunte sobre seu protocolo" autocomplete="off">
                <button type="submit" aria-label="Enviar mensagem"><i class="fas fa-paper-plane"></i></button>
            </form>
        `;
        document.body.appendChild(panel);

        panel.querySelector('[data-close-chat]').addEventListener('click', () => {
            panel.classList.remove('open');
        });
        panel.querySelector('[data-chat-form]').addEventListener('submit', event => {
            event.preventDefault();
            const input = panel.querySelector('[data-chat-input]');
            const message = input.value.trim();
            if (!message) return;
            processUserMessage(panel, message);
            input.value = '';
        });

        renderQuickActions(panel);
        return panel;
    }

    function renderQuickActions(panel) {
        const container = panel.querySelector('[data-chat-actions]');
        container.innerHTML = '';
        quickActions.forEach(action => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = action.label;
            button.addEventListener('click', () => processUserMessage(panel, action.message));
            container.appendChild(button);
        });
    }

    function appendMessage(panel, content, author, isHtml = false) {
        const messages = panel.querySelector('[data-chat-messages]');
        const message = document.createElement('div');
        message.className = `client-chat-message ${author}`;
        if (isHtml) {
            message.innerHTML = content;
        } else {
            message.textContent = content;
        }
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function normalizeText(text) {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[?!.,]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function formatList(items, emptyText) {
        if (!items || items.length === 0) return `<p>${emptyText}</p>`;
        return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getInitialMessage(context) {
        const people = context.extractedData.involvedPeople;
        return `
            <p>Olá, <strong>${escapeHtml(context.customer.name)}</strong>.</p>
            <p>Seu protocolo foi criado com sucesso.</p>
            <dl class="protocol-summary">
                <div><dt>Protocolo</dt><dd>${escapeHtml(context.protocol.id)}</dd></div>
                <div><dt>Documentos recebidos</dt><dd>${context.documents.receivedCount}</dd></div>
                <div><dt>Data do evento</dt><dd>${escapeHtml(context.event.date)}</dd></div>
                <div><dt>Local</dt><dd>${escapeHtml(context.event.location)}</dd></div>
                <div><dt>Valor estimado</dt><dd>${escapeHtml(context.event.estimatedValue)}</dd></div>
            </dl>
            <p><strong>Envolvidos:</strong></p>
            ${formatList(people, 'Nenhuma pessoa identificada até o momento.')}
            <p><strong>Status atual:</strong><br>${escapeHtml(context.protocol.status)}</p>
            <p><strong>Prazo estimado:</strong><br>${escapeHtml(context.protocol.estimatedDeadline)}.</p>
            <p>Posso consultar status, documentos, pendências, inconsistências, envolvidos, valores e próximos passos.</p>
            <p>Como posso ajudar?</p>
        `;
    }

    function getSummaryResponse(context) {
        const pending = context.documents.pending.length
            ? context.documents.pending.join(', ')
            : 'Nenhuma pendência encontrada';
        return `
            <p><strong>Resumo do protocolo</strong></p>
            <dl class="protocol-summary">
                <div><dt>Protocolo</dt><dd>${escapeHtml(context.protocol.id)}</dd></div>
                <div><dt>Documentos</dt><dd>${context.documents.receivedCount} recebidos</dd></div>
                <div><dt>Evento</dt><dd>${escapeHtml(context.event.date)}</dd></div>
                <div><dt>Valor estimado</dt><dd>${escapeHtml(context.event.estimatedValue)}</dd></div>
                <div><dt>Envolvidos</dt><dd>${context.extractedData.involvedPeople.length} pessoas identificadas</dd></div>
                <div><dt>Status</dt><dd>${escapeHtml(context.protocol.status)}</dd></div>
                <div><dt>Pendências</dt><dd>${escapeHtml(pending)}</dd></div>
                <div><dt>Prazo estimado</dt><dd>${escapeHtml(context.protocol.estimatedDeadline)}</dd></div>
            </dl>
        `;
    }

    function getIntentResponse(message, context) {
        const text = normalizeText(message);

        if (/(resumo|resumir|resuma)/.test(text)) {
            return getSummaryResponse(context);
        }

        if (/(prazo|quanto tempo|quando recebo|demora|terminar|conclusao)/.test(text)) {
            return `<p>A previsão atual para conclusão da análise é de <strong>${escapeHtml(context.protocol.estimatedDeadline)}</strong>. Caso seja necessária documentação complementar, você será notificado.</p>`;
        }

        if (/(valor|prejuizo|divergencia financeira|estimado mudou)/.test(text)) {
            return `
                <p>O valor estimado atualmente registrado no protocolo é <strong>${escapeHtml(context.event.estimatedValue)}</strong>.</p>
                <p>${context.protocol.analysisCompleted
                    ? 'A análise automática foi concluída e este é o valor consolidado.'
                    : 'A análise automática ainda não terminou. O valor pode ser atualizado após a validação dos documentos.'}</p>
            `;
        }

        if (/(envolvido|participante|pessoa|quem esta relacionado|quem está relacionado)/.test(text)) {
            return `
                <p>Foram identificadas <strong>${context.extractedData.involvedPeople.length} pessoas</strong> no protocolo:</p>
                ${formatList(context.extractedData.involvedPeople, 'Nenhuma pessoa identificada até o momento.')}
            `;
        }

        if (/(problema|inconsistencia|corrigir|rejeitado|rejeitada|erro|ilegivel|incompleto)/.test(text)) {
            if (context.documents.rejected.length > 0) {
                return `
                    <p>Encontrei os seguintes documentos que requerem correção:</p>
                    <ul>${context.documents.rejected.map(document =>
                        `<li><strong>${escapeHtml(document.label)}</strong>: ${escapeHtml(document.reason)}</li>`
                    ).join('')}</ul>
                    <p>Corrija os arquivos indicados e faça um novo envio.</p>
                `;
            }
            if (!context.protocol.analysisCompleted) {
                return '<p>Nenhum arquivo foi rejeitado no recebimento. A análise automática ainda está em andamento, portanto novas inconsistências podem ser identificadas posteriormente.</p>';
            }
            return '<p>Nenhuma inconsistência foi encontrada nos documentos analisados.</p>';
        }

        if (/(faltando|pendente|falta enviar|preciso enviar)/.test(text)) {
            return context.documents.pending.length
                ? `<p>Estão pendentes:</p>${formatList(context.documents.pending, '')}<p>Envie esses documentos para completar a solicitação.</p>`
                : '<p>Não há documentos pendentes. Todos os documentos necessários foram recebidos.</p>';
        }

        if (/(documento|boletim|laudo|nota fiscal|arquivo|enviei|recebido|processado)/.test(text)) {
            const documents = context.documents.received.map(document =>
                `${document.label} (${document.name})`
            );
            return `
                <p>Foram recebidos <strong>${context.documents.receivedCount} documentos</strong>:</p>
                ${formatList(documents, 'Nenhum documento recebido.')}
                <p>${context.protocol.analysisCompleted
                    ? 'O processamento documental foi concluído.'
                    : 'Os documentos foram recebidos e aguardam a conclusão da análise automática.'}</p>
            `;
        }

        if (/(status|protocolo|processo|atualizacao|analisado|andamento|como esta|como está)/.test(text)) {
            return `
                <p>O protocolo <strong>${escapeHtml(context.protocol.id)}</strong> está com o seguinte status:</p>
                <p><strong>${escapeHtml(context.protocol.status)}</strong></p>
                <p>${context.protocol.analysisCompleted
                    ? 'A análise automática foi concluída.'
                    : 'A análise ainda não terminou. Você será notificado quando houver uma atualização.'}</p>
            `;
        }

        if (/(proximo passo|proximos passos|o que fazer|agora)/.test(text)) {
            return `
                <p>Próximas ações recomendadas:</p>
                ${formatList(context.nextActions, 'Aguarde uma atualização do protocolo.')}
            `;
        }

        return `
            <p>Posso ajudar com informações registradas no protocolo <strong>${escapeHtml(context.protocol.id)}</strong>.</p>
            <p>Você pode perguntar sobre status, documentos enviados, pendências, análise, valores, envolvidos, prazo ou pedir um resumo.</p>
        `;
    }

    function processUserMessage(panel, message) {
        appendMessage(panel, message, 'user');
        window.setTimeout(() => {
            if (!protocolContext) {
                appendMessage(
                    panel,
                    'Ainda não recebi o contexto do protocolo. Conclua o envio dos documentos para iniciar a consulta.',
                    'assistant'
                );
                return;
            }
            appendMessage(panel, getIntentResponse(message, protocolContext), 'assistant', true);
        }, 350);
    }

    function updateContextBadge(panel, context) {
        const badge = panel.querySelector('[data-chat-context]');
        badge.innerHTML = `
            <span><i class="fas fa-hashtag"></i> ${escapeHtml(context.protocol.id)}</span>
            <span><i class="fas fa-clock"></i> ${escapeHtml(context.protocol.status)}</span>
        `;
    }

    window.addEventListener('docsmart:start-service', event => {
        const context = event.detail?.protocol;
        if (!context) return;

        protocolContext = context;
        const panel = document.getElementById('clientChat') || createChatPanel();
        const messages = panel.querySelector('[data-chat-messages]');
        messages.innerHTML = '';
        updateContextBadge(panel, context);
        appendMessage(panel, getInitialMessage(context), 'assistant', true);
        panel.classList.add('open');
        panel.querySelector('[data-chat-input]').focus();
    });
}());
