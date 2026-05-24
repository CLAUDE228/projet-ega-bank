import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Account, BankTransaction, Client } from './models';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent],
  template: `
    <div class="ega-layout">
      <app-sidebar [role]="role" [username]="username"></app-sidebar>

      <div class="ega-main">
        <app-navbar [pageTitle]="'Console Administration'" [breadcrumb]="activeTab | titlecase" [username]="username" [role]="role"></app-navbar>

        <div class="ega-page-content fade-in">

          <!-- KPI Summary -->
          <div class="grid-4 mb-4">
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,33,68,0.07)"><i class="fas fa-users" style="color:#003366"></i></div>
              <div class="stat-value">{{ clients.length }}</div>
              <div class="stat-label">Total Clients</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,198,255,0.1)"><i class="fas fa-credit-card" style="color:#0072ff"></i></div>
              <div class="stat-value">{{ accounts.length }}</div>
              <div class="stat-label">Comptes Actifs</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(0,214,143,0.1)"><i class="fas fa-coins" style="color:#00a36c"></i></div>
              <div class="stat-value">{{ totalBalance | number:'1.0-0' }} €</div>
              <div class="stat-label">Encours Total</div>
            </div>
            <div class="stat-summary-card">
              <div class="stat-icon" style="background:rgba(245,166,35,0.1)"><i class="fas fa-search-dollar" style="color:#c88a00"></i></div>
              <div class="stat-value">{{ auditTransactions.length }}</div>
              <div class="stat-label">Transactions auditées</div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="ega-tabs mb-4">
            <button class="ega-tab-btn" [class.active]="activeTab==='clients'" (click)="activeTab='clients'">
              <i class="fas fa-users"></i> Clients
            </button>
            <button class="ega-tab-btn" [class.active]="activeTab==='accounts'" (click)="activeTab='accounts'">
              <i class="fas fa-wallet"></i> Comptes
            </button>
            <button class="ega-tab-btn" [class.active]="activeTab==='audit'" (click)="activeTab='audit'">
              <i class="fas fa-search-dollar"></i> Audit
            </button>
          </div>

          <!-- ===================== CLIENTS TAB ===================== -->
          <div *ngIf="activeTab === 'clients'" class="ega-card fade-in">
            <div class="ega-section-header mb-3">
              <h3 style="font-size:1.05rem;color:#001226">📋 Dossiers Clients</h3>
              <button class="btn-ega-primary" (click)="openClientModal()">
                <i class="fas fa-plus"></i> Nouveau Client
              </button>
            </div>
            <div class="ega-search mb-3">
              <i class="fas fa-search"></i>
              <input class="ega-input" [(ngModel)]="clientQ" placeholder="Rechercher par nom, prénom ou email...">
            </div>
            <div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(0,0,0,0.06)">
              <table class="ega-table">
                <thead>
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Nationalité</th>
                    <th>Genre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredClients()">
                    <td><strong>{{ c.lastName }} {{ c.firstName }}</strong></td>
                    <td>{{ c.email }}</td>
                    <td>{{ c.phoneNumber }}</td>
                    <td>{{ c.nationality }}</td>
                    <td>
                      <span style="padding:3px 9px;border-radius:20px;font-size:0.72rem;font-weight:700"
                            [style.background]="c.gender==='MALE' ? 'rgba(30,144,255,0.1)' : 'rgba(255,105,180,0.1)'"
                            [style.color]="c.gender==='MALE' ? '#1e90ff' : '#ff69b4'">
                        {{ c.gender === 'MALE' ? 'Homme' : 'Femme' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:6px">
                        <button class="btn-ega-ghost" style="padding:6px 12px;font-size:0.78rem" (click)="editClient(c)">
                          <i class="fas fa-edit"></i> Éditer
                        </button>
                        <button class="btn-ega-danger" (click)="deleteClient(c.id)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredClients().length === 0">
                    <td colspan="6" class="empty-hint">Aucun client trouvé.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ===================== ACCOUNTS TAB ===================== -->
          <div *ngIf="activeTab === 'accounts'" class="ega-card fade-in">
            <div class="ega-section-header mb-3">
              <h3 style="font-size:1.05rem;color:#001226">💳 Comptes Bancaires</h3>
              <button class="btn-ega-primary" (click)="openAccountModal()">
                <i class="fas fa-plus"></i> Ouvrir un Compte
              </button>
            </div>
            <div class="ega-search mb-3">
              <i class="fas fa-search"></i>
              <input class="ega-input" [(ngModel)]="accountQ" placeholder="Rechercher par IBAN ou titulaire...">
            </div>
            <div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(0,0,0,0.06)">
              <table class="ega-table">
                <thead>
                  <tr>
                    <th>IBAN</th>
                    <th>Titulaire</th>
                    <th>Type</th>
                    <th>Solde</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of filteredAccounts()">
                    <td><code style="font-size:0.85rem;color:#003366">{{ a.accountNumber }}</code></td>
                    <td>{{ a.ownerFullName }}</td>
                    <td>
                      <span [ngClass]="a.type === 'SAVINGS' ? 'type-savings' : 'type-current'">
                        {{ a.type === 'SAVINGS' ? 'Épargne' : 'Courant' }}
                      </span>
                    </td>
                    <td><strong>{{ a.balance | number:'1.2-2' }} €</strong></td>
                    <td>
                      <button class="btn-ega-danger" (click)="deleteAccount(a.id)">
                        <i class="fas fa-times-circle"></i> Fermer
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredAccounts().length === 0">
                    <td colspan="5" class="empty-hint">Aucun compte trouvé.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ===================== AUDIT TAB ===================== -->
          <div *ngIf="activeTab === 'audit'" class="fade-in" style="display:grid;grid-template-columns:300px 1fr;gap:24px">

            <!-- Account Picker -->
            <div class="ega-card">
              <h3 style="font-size:1rem;color:#001226;margin-bottom:16px">🔍 Choisir un compte</h3>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
                <div class="ega-search" style="flex:1">
                <i class="fas fa-search"></i>
                <input class="ega-input" [(ngModel)]="auditQ" placeholder="Filtrer...">
                </div>
                <button class="btn-ega-ghost" (click)="loadAllAuditTransactions()">Toutes les transactions</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;max-height:450px;overflow-y:auto">
                <div *ngFor="let a of filteredAuditAccounts()" (click)="selectAuditAccount(a)"
                     class="audit-acc-item" [class.audit-acc-active]="auditAccount?.id === a.id">
                  <strong style="font-size:0.85rem">{{ a.ownerFullName }}</strong>
                  <code style="font-size:0.72rem;color:#6c757d">{{ a.accountNumber }}</code>
                  <span style="font-weight:700;color:#003366;margin-left:auto">{{ a.balance | number:'1.0-0' }} €</span>
                </div>
                <p class="empty-hint" *ngIf="filteredAuditAccounts().length === 0">Aucun compte.</p>
              </div>
            </div>

            <!-- Transactions Journal -->
            <div class="ega-card">
              <div class="ega-section-header" style="border-bottom:1px solid rgba(0,0,0,0.06);padding-bottom:14px;margin-bottom:16px">
                <h3 style="font-size:1rem;color:#001226">📊 Journal d'Audit Financier</h3>
                <button *ngIf="auditAccount" class="btn-ega-ghost" style="font-size:0.8rem;padding:7px 14px" (click)="downloadAuditPdf()">
                  <i class="fas fa-file-pdf"></i> Export PDF
                </button>
              </div>

              <p class="empty-hint" *ngIf="!auditAccount">Sélectionnez un compte dans le panneau de gauche.</p>

              <div class="tx-list" *ngIf="auditAccount">
                <p class="empty-hint" *ngIf="auditTransactions.length === 0">Aucune transaction (30j).</p>
                <div *ngFor="let t of auditTransactions" class="tx-item">
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
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL: Create / Edit Client -->
    <div class="ega-modal-overlay" *ngIf="showClientModal">
      <div class="ega-modal">
        <div class="ega-modal-header">
          <h4><i class="fas fa-user me-2"></i>{{ editingClient ? 'Modifier le Client' : 'Nouveau Client' }}</h4>
          <button class="ega-modal-close" (click)="closeClientModal()">&times;</button>
        </div>
        <form (ngSubmit)="saveClient()">
          <div class="ega-modal-body">
            <div class="grid-2">
              <div><label class="ega-label">Nom</label><input class="ega-input" [(ngModel)]="cf.lastName" name="ln" required placeholder="Diop"></div>
              <div><label class="ega-label">Prénom</label><input class="ega-input" [(ngModel)]="cf.firstName" name="fn" required placeholder="Amina"></div>
            </div>
            <div class="grid-2">
              <div><label class="ega-label">Email</label><input class="ega-input" [(ngModel)]="cf.email" name="em" type="email" required placeholder="client@ega.com"></div>
              <div><label class="ega-label">Téléphone</label><input class="ega-input" [(ngModel)]="cf.phoneNumber" name="ph" required placeholder="+221770000000"></div>
            </div>
            <div class="grid-2">
              <div><label class="ega-label">Date de naissance</label><input class="ega-input" [(ngModel)]="cf.birthDate" name="bd" type="date" required></div>
              <div>
                <label class="ega-label">Genre</label>
                <select class="ega-select" [(ngModel)]="cf.gender" name="gn">
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
            <div class="grid-2">
              <div><label class="ega-label">Adresse</label><input class="ega-input" [(ngModel)]="cf.address" name="ad" required placeholder="Dakar, Plateau"></div>
              <div><label class="ega-label">Nationalité</label><input class="ega-input" [(ngModel)]="cf.nationality" name="na" required placeholder="Sénégalaise"></div>
            </div>
          </div>
          <div class="ega-modal-footer">
            <button type="button" class="btn-ega-ghost" (click)="closeClientModal()">Annuler</button>
            <button type="submit" class="btn-ega-primary">
              <i class="fas fa-save"></i> {{ editingClient ? 'Mettre à jour' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: Create Account -->
    <div class="ega-modal-overlay" *ngIf="showAccountModal">
      <div class="ega-modal">
        <div class="ega-modal-header">
          <h4><i class="fas fa-credit-card me-2"></i> Ouvrir un Compte</h4>
          <button class="ega-modal-close" (click)="showAccountModal = false">&times;</button>
        </div>
        <form (ngSubmit)="createAccount()">
          <div class="ega-modal-body">
            <div>
              <label class="ega-label">Titulaire</label>
              <select class="ega-select" [(ngModel)]="newAcc.ownerId" name="oid" required>
                <option *ngFor="let c of clients" [value]="c.id">{{ c.lastName }} {{ c.firstName }} — {{ c.email }}</option>
              </select>
            </div>
            <div>
              <label class="ega-label">Type de Compte</label>
              <select class="ega-select" [(ngModel)]="newAcc.type" name="tp">
                <option value="CURRENT">Compte Courant</option>
                <option value="SAVINGS">Compte Épargne</option>
              </select>
            </div>
          </div>
          <div class="ega-modal-footer">
            <button type="button" class="btn-ega-ghost" (click)="showAccountModal = false">Annuler</button>
            <button type="submit" class="btn-ega-primary"><i class="fas fa-check"></i> Créer</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .audit-acc-item {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      padding: 10px 12px; border-radius: 10px; cursor: pointer;
      border: 1px solid rgba(0,0,0,0.06); transition: all 0.2s;
    }
    .audit-acc-item:hover { background: rgba(0,33,68,0.03); }
    .audit-acc-active { border-color: #00c6ff; background: rgba(0,198,255,0.05); }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);

  role = localStorage.getItem('ega_role');
  username = '';
  clients: Client[] = [];
  accounts: Account[] = [];
  auditTransactions: BankTransaction[] = [];
  auditAccount: Account | null = null;

  activeTab: 'clients' | 'accounts' | 'audit' = 'clients';
  clientQ = ''; accountQ = ''; auditQ = '';
  totalBalance = 0;

  showClientModal = false;
  showAccountModal = false;
  editingClient: Client | null = null;

  cf: any = this.blankForm();
  newAcc: { ownerId?: number; type: 'CURRENT' | 'SAVINGS' } = { type: 'CURRENT' };

  ngOnInit() {
    this.api.getProfile().subscribe(p => this.username = p.username);
    this.reload();
  }

  reload() {
    this.api.getClients().subscribe(c => this.clients = c);
    this.api.getAccounts().subscribe(a => {
      this.accounts = a;
      this.totalBalance = a.reduce((s, ac) => s + ac.balance, 0);
    });
  }

  /* ---- Filters ---- */
  filteredClients() {
    const q = this.clientQ.toLowerCase();
    return !q ? this.clients : this.clients.filter(c =>
      c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }
  filteredAccounts() {
    const q = this.accountQ.toLowerCase();
    return !q ? this.accounts : this.accounts.filter(a =>
      a.accountNumber.toLowerCase().includes(q) || a.ownerFullName.toLowerCase().includes(q));
  }
  filteredAuditAccounts() {
    const q = this.auditQ.toLowerCase();
    return !q ? this.accounts : this.accounts.filter(a =>
      a.accountNumber.toLowerCase().includes(q) || a.ownerFullName.toLowerCase().includes(q));
  }

  /* ---- Client CRUD ---- */
  openClientModal() { this.editingClient = null; this.cf = this.blankForm(); this.showClientModal = true; }
  editClient(c: Client) { this.editingClient = c; this.cf = { ...c }; this.showClientModal = true; }
  closeClientModal() { this.showClientModal = false; this.editingClient = null; }

  saveClient() {
    const obs = this.editingClient
      ? this.api.updateClient(this.editingClient.id, this.cf)
      : this.api.createClient(this.cf);
    obs.subscribe({ next: () => { this.closeClientModal(); this.reload(); }, error: e => alert(e?.error?.message ?? 'Erreur') });
  }

  deleteClient(id: number) {
    if (!confirm('Supprimer définitivement ce client ?')) return;
    this.api.deleteClient(id).subscribe({ next: () => this.reload(), error: e => alert(e?.error?.message ?? 'Erreur') });
  }

  /* ---- Account CRUD ---- */
  openAccountModal() { this.newAcc = { type: 'CURRENT' }; this.showAccountModal = true; }
  createAccount() {
    if (!this.newAcc.ownerId) { alert('Sélectionnez un titulaire.'); return; }
    this.api.createAccount({ ownerId: Number(this.newAcc.ownerId), type: this.newAcc.type }).subscribe({
      next: () => { this.showAccountModal = false; this.reload(); },
      error: e => alert(e?.error?.message ?? 'Erreur')
    });
  }
  deleteAccount(id: number) {
    if (!confirm('Fermer définitivement ce compte ?')) return;
    this.api.deleteAccount(id).subscribe({ next: () => this.reload(), error: e => alert(e?.error?.message ?? 'Erreur') });
  }

  /* ---- Audit ---- */
  selectAuditAccount(a: Account) {
    this.auditAccount = a;
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    this.api.getTransactions(a.id, start, end).subscribe(t => this.auditTransactions = t);
  }

  downloadAuditPdf() {
    if (!this.auditAccount) return;
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    this.api.downloadStatement(this.auditAccount.id, start, end).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `audit-${this.auditAccount!.accountNumber}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  loadAllAuditTransactions() {
    const end = new Date().toISOString().slice(0,10);
    const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0,10);
    this.api.getAllTransactions({ start, end }).subscribe({ next: t => { this.auditTransactions = t; this.auditAccount = null; this.activeTab = 'audit'; }, error: e => alert(e?.error?.message ?? 'Erreur chargement') });
  }

  blankForm() {
    return { firstName: '', lastName: '', email: '', phoneNumber: '', birthDate: '', gender: 'MALE', address: '', nationality: '' };
  }

  isPos(type: string) { return type === 'DEPOSIT' || type === 'TRANSFER_IN'; }
  getTxIcon(type: string): { cls: string; icon: string } {
    if (type === 'DEPOSIT') return { cls: 'dep', icon: 'fas fa-arrow-down' };
    if (type === 'WITHDRAWAL') return { cls: 'wit', icon: 'fas fa-arrow-up' };
    return { cls: 'tra', icon: 'fas fa-exchange-alt' };
  }
}
