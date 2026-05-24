import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './api.service';
import { Account, BankTransaction } from './models';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  template: `
    <div class="ega-layout">

      <!-- Sidebar -->
      <app-sidebar [role]="role" [username]="username"></app-sidebar>

      <!-- Main -->
      <div class="ega-main">
        <app-navbar [pageTitle]="'Mon Espace Bancaire'" [breadcrumb]="activeTab | titlecase" [username]="username" [role]="role"></app-navbar>

        <div class="ega-page-content fade-in">

          <!-- KPI Summary Cards -->
          <div class="grid-4 mb-4">
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,33,68,0.07)"><i class="fas fa-wallet" style="color:#003366"></i></div>
              <div class="stat-value">{{ totalBalance | number:'1.0-0' }} €</div>
              <div class="stat-label">Fortune Globale</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,198,255,0.1)"><i class="fas fa-credit-card" style="color:#0072ff"></i></div>
              <div class="stat-value">{{ accounts.length }}</div>
              <div class="stat-label">Comptes Actifs</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,214,143,0.1)"><i class="fas fa-arrow-down" style="color:#00a36c"></i></div>
              <div class="stat-value">{{ totalDeposits | number:'1.0-0' }} €</div>
              <div class="stat-label">Dépôts (30j)</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(255,71,87,0.1)"><i class="fas fa-arrow-up" style="color:#c0392b"></i></div>
              <div class="stat-value">{{ totalWithdrawals | number:'1.0-0' }} €</div>
              <div class="stat-label">Retraits (30j)</div>
            </div>
          </div>

          <!-- Main Grid: Cards list + Active Operations -->
          <div class="ud-grid">

            <!-- LEFT: Accounts List -->
            <div>
              <div class="ega-section-header">
                <h2 *ngIf="!showWallets">💳 Mes Comptes</h2>
                <h2 *ngIf="showWallets">💼 Mes Portefeuilles</h2>
                <button class="btn-ega-electric" (click)="openNewAccountModal()">
                  <i class="fas fa-plus"></i>
                  <span *ngIf="!showWallets">Ouvrir un compte</span>
                  <span *ngIf="showWallets">Créer un portefeuille</span>
                </button>
              </div>

              <p class="empty-hint" *ngIf="accounts.length === 0">
                Vous n'avez aucun compte. Ouvrez-en un ci-dessus.
              </p>

              <div class="ud-cards-list">
                <div *ngFor="let a of accounts"
                     (click)="selectAccount(a)"
                     class="bank-physical-card"
                     [ngClass]="{'savings': a.type === 'SAVINGS', 'active-card': selectedAccount?.id === a.id}">
                  <div class="card-glow"></div>
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <div class="card-chip"></div>
                    <span class="card-type">{{ a.type === 'SAVINGS' ? 'ÉPARGNE' : 'COURANT' }}</span>
                  </div>
                  <div>
                    <div class="card-balance-label">Solde disponible</div>
                    <div class="card-balance">{{ a.balance | number:'1.2-2' }} €</div>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <div class="card-iban">{{ formatIban(a.accountNumber) }}</div>
                    <div class="card-brand">Ega<span>Bank</span></div>
                  </div>
                  <div class="active-pill" *ngIf="selectedAccount?.id === a.id">✓ Sélectionné</div>
                </div>
              </div>
            </div>

            <!-- RIGHT: Operations + History -->
            <div>
              <!-- No account selected -->
              <div class="ega-card empty-panel" *ngIf="!selectedAccount">
                <div class="empty-icon"><i class="fas fa-hand-pointer"></i></div>
                <h3>Sélectionnez un compte</h3>
                <p>Cliquez sur une carte à gauche pour accéder aux opérations bancaires.</p>
              </div>

              <!-- Account selected -->
              <div *ngIf="selectedAccount" class="fade-in">

                <!-- Operations Card -->
                <div class="ega-card mb-4">
                  <div class="ega-section-header" style="padding-bottom:16px;border-bottom:1px solid rgba(0,0,0,0.06)">
                    <h3 style="font-size:1rem;color:#001226">Opérations — <code style="font-size:0.8rem;color:#003366">{{ selectedAccount.accountNumber }}</code></h3>
                  </div>

                  <div class="ega-tabs" style="margin: 16px 0">
                    <button class="ega-tab-btn" [class.active]="activeTab==='deposit'" (click)="activeTab='deposit'">
                      <i class="fas fa-download"></i> Dépôt
                    </button>
                    <button class="ega-tab-btn" [class.active]="activeTab==='withdraw'" (click)="activeTab='withdraw'">
                      <i class="fas fa-upload"></i> Retrait
                    </button>
                    <button class="ega-tab-btn" [class.active]="activeTab==='transfer'" (click)="activeTab='transfer'">
                      <i class="fas fa-exchange-alt"></i> Virement
                    </button>
                  </div>

                  <!-- DEPOSIT -->
                  <div *ngIf="activeTab === 'deposit'" class="gap-form fade-in">
                    <div class="grid-2">
                      <div>
                        <label class="ega-label">Montant (€)</label>
                        <input class="ega-input" [(ngModel)]="opAmount" type="number" min="0.01" placeholder="Ex: 100.00">
                      </div>
                      <div>
                        <label class="ega-label">Description</label>
                        <input class="ega-input" [(ngModel)]="opDescription" placeholder="Espèces, chèque...">
                      </div>
                    </div>
                    <button class="btn-ega-success" style="width:100%;padding:12px;font-size:0.9rem" (click)="deposit()">
                      <i class="fas fa-check-circle"></i> Valider le versement
                    </button>
                  </div>

                  <!-- WITHDRAW -->
                  <div *ngIf="activeTab === 'withdraw'" class="gap-form fade-in">
                    <div class="grid-2">
                      <div>
                        <label class="ega-label">Montant (€)</label>
                        <input class="ega-input" [(ngModel)]="opAmount" type="number" min="0.01" placeholder="Ex: 50.00">
                      </div>
                      <div>
                        <label class="ega-label">Motif</label>
                        <input class="ega-input" [(ngModel)]="opDescription" placeholder="Distributeur, achat...">
                      </div>
                    </div>
                    <button class="btn-ega-danger" style="width:100%;padding:12px;font-size:0.9rem" (click)="withdraw()">
                      <i class="fas fa-minus-circle"></i> Confirmer le retrait
                    </button>
                  </div>

                  <!-- TRANSFER -->
                  <div *ngIf="activeTab === 'transfer'" class="gap-form fade-in">
                    <div>
                      <label class="ega-label">IBAN Bénéficiaire</label>
                      <input class="ega-input" [(ngModel)]="transferTarget" placeholder="Numéro de compte destinataire">
                    </div>
                    <div class="grid-2">
                      <div>
                        <label class="ega-label">Montant (€)</label>
                        <input class="ega-input" [(ngModel)]="opAmount" type="number" min="0.01" placeholder="0.00">
                      </div>
                      <div>
                        <label class="ega-label">Motif</label>
                        <input class="ega-input" [(ngModel)]="opDescription" placeholder="Loyer, cadeau...">
                      </div>
                    </div>
                    <button class="btn-ega-primary" style="width:100%;padding:12px;font-size:0.9rem" (click)="doTransfer()">
                      <i class="fas fa-paper-plane"></i> Exécuter le virement
                    </button>
                  </div>
                </div>

                <!-- Transactions History -->
                <div class="ega-card">
                  <div class="ega-section-header" style="padding-bottom:14px;border-bottom:1px solid rgba(0,0,0,0.06);margin-bottom:16px">
                    <h3 style="font-size:1rem;color:#001226">📜 Historique (30 derniers jours)</h3>
                    <button class="btn-ega-ghost" style="font-size:0.8rem;padding:7px 14px" (click)="downloadPdf()">
                      <i class="fas fa-file-pdf"></i> Relevé PDF
                    </button>
                  </div>

                  <p class="empty-hint" *ngIf="transactions.length === 0">Aucune transaction enregistrée.</p>
                  <div class="tx-list">
                    <div *ngFor="let t of transactions" class="tx-item">
                      <div class="tx-left">
                        <div class="tx-icon" [ngClass]="getTxIcon(t.type).cls">
                          <i [class]="getTxIcon(t.type).icon"></i>
                        </div>
                        <div>
                          <div class="tx-desc">{{ t.description || 'Transaction' }}</div>
                          <div class="tx-date">{{ t.transactionDate | date:'dd/MM/yyyy HH:mm' }}</div>
                        </div>
                      </div>
                      <div class="tx-right">
                        <div class="tx-amount" [ngClass]="isPos(t.type) ? 'pos' : 'neg'">
                          {{ isPos(t.type) ? '+' : '-' }}{{ t.amount | number:'1.2-2' }} €
                        </div>
                        <span class="badge-deposit" *ngIf="t.type==='DEPOSIT'">Dépôt</span>
                        <span class="badge-withdraw" *ngIf="t.type==='WITHDRAWAL'">Retrait</span>
                        <span class="badge-transfer" *ngIf="t.type==='TRANSFER_IN'||t.type==='TRANSFER_OUT'">Virement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL: Ouvrir un compte -->
    <div class="ega-modal-overlay" *ngIf="showNewAccountModal">
      <div class="ega-modal">
        <div class="ega-modal-header">
          <h4><i class="fas fa-credit-card me-2"></i> Ouvrir un nouveau compte</h4>
          <button class="ega-modal-close" (click)="showNewAccountModal = false">&times;</button>
        </div>
        <div class="ega-modal-body">
          <p style="color:#6c757d;font-size:0.875rem">Sélectionnez la formule de compte à ouvrir. Un IBAN unique sera généré automatiquement.</p>
          <div>
            <label class="ega-label">Type de Compte</label>
            <select class="ega-select" [(ngModel)]="newAccountType">
              <option value="CURRENT">Compte Courant — Usage quotidien</option>
              <option value="SAVINGS">Compte Épargne — Placement rémunéré</option>
            </select>
          </div>
        </div>
        <div class="ega-modal-footer">
          <button class="btn-ega-ghost" (click)="showNewAccountModal = false">Annuler</button>
          <button class="btn-ega-electric" (click)="createAccount()">
            <i class="fas fa-plus-circle"></i> Ouvrir le compte
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ud-grid { display: grid; grid-template-columns: 1.1fr 1.4fr; gap: 28px; }
    .ud-cards-list { display: flex; flex-direction: column; gap: 20px; }
    .bank-physical-card { cursor: pointer; position: relative; }
    .active-card { outline: 3px solid #00c6ff; outline-offset: 3px; }
    .active-pill {
      position: absolute; top: 14px; right: 14px;
      background: #00c6ff; color: #001226; font-size: 0.7rem; font-weight: 800;
      padding: 3px 10px; border-radius: 20px;
    }
    .empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; text-align: center; color: #6c757d; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 16px; opacity: 0.3; }
    .empty-panel h3 { font-size: 1.1rem; color: #001226; margin-bottom: 8px; }
    .empty-panel p { font-size: 0.875rem; max-width: 260px; }
    @media (max-width: 900px) { .ud-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserDashboardComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  role = localStorage.getItem('ega_role');
  username = '';
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: BankTransaction[] = [];

  activeTab: 'deposit' | 'withdraw' | 'transfer' = 'deposit';
  opAmount: number = 0;
  opDescription: string = '';
  transferTarget: string = '';

  showNewAccountModal = false;
  newAccountType: 'CURRENT' | 'SAVINGS' = 'CURRENT';
  // UI view control (respond to sidebar query params)
  currentTab: string | null = null;
  showWallets = false;

  totalBalance = 0;
  totalDeposits = 0;
  totalWithdrawals = 0;

  ngOnInit() {
    this.api.getProfile().subscribe(p => { this.username = p.username; });
    // react to query params from sidebar links (accounts / operations / wallets)
    this.route.queryParams.subscribe(q => {
      this.currentTab = q['tab'] ?? null;
      this.showWallets = this.currentTab === 'wallets';
      // when asking for operations, prefer the first account and open deposit tab
      if (this.currentTab === 'operations') this.activeTab = 'deposit';
    });

    this.loadAccounts();
  }

  loadAccounts() {
    this.api.getMyAccounts().subscribe(a => {
      this.accounts = a;
      this.totalBalance = a.reduce((s, ac) => s + ac.balance, 0);
      // If the user explicitly asked to see the accounts list, don't auto-select one
      if (this.currentTab === 'accounts') {
        this.selectedAccount = null;
      } else if (!this.selectedAccount && a.length > 0) {
        this.selectAccount(a[0]);
      } else if (this.selectedAccount) {
        const refreshed = a.find(ac => ac.id === this.selectedAccount!.id);
        if (refreshed) this.selectedAccount = refreshed;
      }
    });
  }

  selectAccount(a: Account) {
    this.selectedAccount = a;
    this.opAmount = 0; this.opDescription = ''; this.transferTarget = '';
    this.loadTransactions(a.id);
  }

  loadTransactions(id: number) {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    this.api.getTransactions(id, start, end).subscribe(t => {
      this.transactions = t;
      this.totalDeposits = t.filter(tx => tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN').reduce((s, tx) => s + tx.amount, 0);
      this.totalWithdrawals = t.filter(tx => tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT').reduce((s, tx) => s + tx.amount, 0);
    });
  }

  createAccount() {
    const ownerId = localStorage.getItem('ega_clientId');
    if (!ownerId) { alert('ID client manquant. Reconnectez-vous.'); return; }
    this.api.createAccount({ ownerId: Number(ownerId), type: this.newAccountType }).subscribe({
      next: () => { this.showNewAccountModal = false; this.loadAccounts(); },
      error: e => alert(e?.error?.message ?? 'Erreur lors de la création du compte')
    });
  }

  openNewAccountModal() {
    // prefer a savings account when creating a "portefeuille"
    this.newAccountType = this.showWallets ? 'SAVINGS' : 'CURRENT';
    this.showNewAccountModal = true;
  }

  deposit() {
    if (!this.selectedAccount || this.opAmount <= 0) { alert('Montant invalide.'); return; }
    this.api.deposit(this.selectedAccount.id, { amount: this.opAmount, description: this.opDescription }).subscribe({
      next: () => { this.opAmount = 0; this.opDescription = ''; this.loadAccounts(); },
      error: e => alert(e?.error?.message ?? 'Erreur dépôt')
    });
  }

  withdraw() {
    if (!this.selectedAccount || this.opAmount <= 0) { alert('Montant invalide.'); return; }
    this.api.withdraw(this.selectedAccount.id, { amount: this.opAmount, description: this.opDescription }).subscribe({
      next: () => { this.opAmount = 0; this.opDescription = ''; this.loadAccounts(); },
      error: e => alert(e?.error?.message ?? 'Erreur retrait')
    });
  }

  doTransfer() {
    if (!this.selectedAccount || !this.transferTarget || this.opAmount <= 0) { alert('Champs requis manquants.'); return; }
    this.api.getAccountByNumber(this.transferTarget).subscribe({
      next: target => {
        this.api.transfer({ sourceAccountId: this.selectedAccount!.id, targetAccountId: target.id, amount: this.opAmount, description: this.opDescription }).subscribe({
          next: () => { this.transferTarget = ''; this.opAmount = 0; this.opDescription = ''; this.loadAccounts(); },
          error: e => alert(e?.error?.message ?? 'Erreur virement')
        });
      },
      error: () => alert('IBAN destinataire introuvable.')
    });
  }

  downloadPdf() {
    if (!this.selectedAccount) return;
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    this.api.downloadStatement(this.selectedAccount.id, start, end).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `releve-${this.selectedAccount!.accountNumber}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  formatIban(iban: string) { return iban?.match(/.{1,4}/g)?.join(' ') ?? iban; }
  isPos(type: string) { return type === 'DEPOSIT' || type === 'TRANSFER_IN'; }
  getTxIcon(type: string): { cls: string; icon: string } {
    if (type === 'DEPOSIT') return { cls: 'dep', icon: 'fas fa-arrow-down' };
    if (type === 'WITHDRAWAL') return { cls: 'wit', icon: 'fas fa-arrow-up' };
    return { cls: 'tra', icon: 'fas fa-exchange-alt' };
  }
}
