import { Component, inject, signal, viewChild, ElementRef, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../../../core/services/agent.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex flex-col max-w-3xl mx-auto p-4 md:p-6 gap-4">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"/>
            <path d="M12 12c-2.87 0-6.13.87-8.36 2.34A3 3 0 0 0 2 17.05V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.95a3 3 0 0 0-1.64-2.71C18.13 12.87 14.87 12 12 12Z"/>
            <path d="M9 10h.01"/>
            <path d="M15 10h.01"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-semibold text-text-primary">Asesor de Subastas</h1>
          <p class="text-xs text-text-secondary">Asistente experto en subastas TRATO</p>
        </div>
        <button (click)="clearChat()" class="ml-auto text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-surface-alt">
          Nueva conversación
        </button>
      </div>

      <div #messagesContainer class="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth" style="max-height: calc(100vh - 16rem)">
        @if (messages().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z"/>
                <path d="M12 12c-2.87 0-6.13.87-8.36 2.34A3 3 0 0 0 2 17.05V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.95a3 3 0 0 0-1.64-2.71C18.13 12.87 14.87 12 12 12Z"/>
              </svg>
            </div>
            <h2 class="text-lg font-medium text-text-primary mb-2">¿En qué puedo ayudarte?</h2>
            <p class="text-sm text-text-secondary max-w-md">
              Pregúntame sobre subastas, pujas, productos o cualquier cosa relacionada con TRATO.
              Puedo analizar competencia, estimar precios justos y recomendarte la mejor estrategia.
            </p>
            <div class="flex flex-wrap gap-2 mt-6 justify-center">
              <button (click)="quickQuestion('¿Vale la pena seguir pujando en la subasta 1?')" class="text-xs px-3 py-2 rounded-lg bg-surface-alt border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors text-text-secondary">
                📊 Analizar subasta
              </button>
              <button (click)="quickQuestion('¿Cuáles son las subastas activas?')" class="text-xs px-3 py-2 rounded-lg bg-surface-alt border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors text-text-secondary">
                🔍 Ver activas
              </button>
              <button (click)="quickQuestion('¿Cómo funciona el asesor?')" class="text-xs px-3 py-2 rounded-lg bg-surface-alt border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors text-text-secondary">
                💡 Ayuda
              </button>
            </div>
          </div>
        }

        @for (msg of messages(); track $index) {
          <div class="flex" [class.justify-end]="msg.role === 'user'">
            <div [class]="msg.role === 'user'
              ? 'max-w-[80%] bg-primary text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-glow'
              : 'max-w-[85%] bg-surface-alt border border-border px-4 py-3 rounded-2xl rounded-bl-sm'">
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          </div>
        }

        @if (loading()) {
          <div class="flex">
            <div class="bg-surface-alt border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div class="flex gap-1.5">
                <div class="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="flex gap-3 items-end pt-2 border-t border-border">
        <input
          #inputField
          [(ngModel)]="input"
          (keydown.enter)="send()"
          placeholder="Pregunta sobre subastas, productos o pujas..."
          class="flex-1 bg-surface-alt border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          [disabled]="loading()"
        >
        <button
          (click)="send()"
          [disabled]="loading() || !input.trim()"
          class="p-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class AgentChatComponent {
  private agentService = inject(AgentService);
  protected messages = signal<Message[]>([]);
  protected loading = signal(false);
  protected input = '';
  private sessionId = signal<string | null>(this.loadSession());
  private messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  constructor() {
    this.messages.set(this.loadMessages());
    afterNextRender(() => this.scrollToBottom());
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading()) return;

    this.input = '';
    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.loading.set(true);
    this.saveState();
    this.scrollToBottom();

    this.agentService.sendMessage(text, this.sessionId() ?? undefined).subscribe({
      next: (res) => {
        this.sessionId.set(res.session_id);
        this.saveSession(res.session_id);
        this.messages.update(m => [...m, { role: 'assistant', content: res.response }]);
        this.loading.set(false);
        this.saveState();
        this.scrollToBottom();
      },
      error: () => {
        this.messages.update(m => [...m, { role: 'assistant', content: '⚠️ Error al conectar con el asesor. Intenta de nuevo.' }]);
        this.loading.set(false);
        this.saveState();
        this.scrollToBottom();
      }
    });
  }

  quickQuestion(q: string) {
    this.input = q;
    this.send();
  }

  clearChat() {
    this.messages.set([]);
    this.sessionId.set(null);
    this.input = '';
    localStorage.removeItem('agent_session_id');
    localStorage.removeItem('agent_messages');
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  private saveSession(id: string) {
    localStorage.setItem('agent_session_id', id);
  }

  private loadSession(): string | null {
    return localStorage.getItem('agent_session_id');
  }

  private saveState() {
    localStorage.setItem('agent_messages', JSON.stringify(this.messages()));
  }

  private loadMessages(): Message[] {
    try {
      const raw = localStorage.getItem('agent_messages');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
