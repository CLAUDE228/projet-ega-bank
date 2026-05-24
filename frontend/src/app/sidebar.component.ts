import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Brand -->
      <div class="sb-brand">
        <div class="sb-icon"><i class="fas fa-university"></i></div>
        <span class="sb-brand-name" *ngIf="!collapsed">EGA<span>BANK</span></span>
        <button class="sb-toggle" (click)="collapsed = !collapsed" [title]="collapsed ? 'Agrandir' : 'Réduire'">
          <i class="fas" [ngClass]="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>
      </div>

      <!-- Nav -->
      <nav class="sb-nav">
        <!-- USER nav -->
        <ng-container *ngIf="role === 'ROLE_USER'">
          <span class="sb-section" *ngIf="!collapsed">CLIENT</span>
          <a class="sb-link" routerLink="/user/dashboard" routerLinkActive="active">
            <i class="fas fa-tachometer-alt"></i>
            <span *ngIf="!collapsed">Tableau de bord</span>
          </a>
          <a class="sb-link" [routerLink]="['/user/dashboard']" [queryParams]="{tab: 'accounts'}" routerLinkActive="active">
            <i class="fas fa-wallet"></i>
            <span *ngIf="!collapsed">Mes comptes</span>
          </a>
          <a class="sb-link" [routerLink]="['/user/dashboard']" [queryParams]="{tab: 'operations'}" routerLinkActive="active">
            <i class="fas fa-exchange-alt"></i>
            <span *ngIf="!collapsed">Dépôts / Retraits</span>
          </a>
          <a class="sb-link" [routerLink]="['/user/dashboard']" [queryParams]="{tab: 'wallets'}" routerLinkActive="active">
            <i class="fas fa-briefcase"></i>
            <span *ngIf="!collapsed">Portefeuilles</span>
          </a>
        </ng-container>

        <!-- ADMIN nav -->
        <ng-container *ngIf="role === 'ROLE_ADMIN'">
          <span class="sb-section" *ngIf="!collapsed">ADMINISTRATION</span>
          <a class="sb-link" routerLink="/admin/dashboard" [queryParams]="{tab:'clients'}" routerLinkActive="active">
            <i class="fas fa-users"></i>
            <span *ngIf="!collapsed">Clients</span>
          </a>
          <a class="sb-link" routerLink="/admin/dashboard" [queryParams]="{tab:'accounts'}" routerLinkActive="active">
            <i class="fas fa-wallet"></i>
            <span *ngIf="!collapsed">Comptes</span>
          </a>
          <a class="sb-link" routerLink="/admin/dashboard" [queryParams]="{tab:'audit'}" routerLinkActive="active">
            <i class="fas fa-search-dollar"></i>
            <span *ngIf="!collapsed">Audit</span>
          </a>
        </ng-container>
      </nav>

      <!-- Footer -->
      <div class="sb-footer" *ngIf="!collapsed">
        <div class="sb-user">
          <div class="sb-avatar">{{ getInitials() }}</div>
          <div class="sb-user-info">
            <span class="sb-username">{{ username || 'Utilisateur' }}</span>
            <span class="sb-role">{{ role === 'ROLE_ADMIN' ? 'Administrateur' : 'Client VIP' }}</span>
          </div>
        </div>
        <button class="sb-logout" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
        </button>
      </div>
      <div class="sb-footer-mini" *ngIf="collapsed">
        <button class="sb-logout-mini" (click)="logout()" title="Déconnexion">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; }

    .sidebar {
      width: 260px; height: 100vh;
      background: #001226;
      display: flex; flex-direction: column;
      position: sticky; top: 0; left: 0;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      border-right: 1px solid rgba(255,255,255,0.04);
      z-index: 100; flex-shrink: 0;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }

    /* Brand */
    .sb-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 22px 18px; border-bottom: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .sb-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 1rem; flex-shrink: 0;
    }
    .sb-brand-name {
      font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 800;
      color: #fff; letter-spacing: -0.03em; white-space: nowrap;
    }
    .sb-brand-name span { color: #00c6ff; }
    .sb-toggle {
      margin-left: auto; background: rgba(255,255,255,0.05); border: none;
      color: rgba(255,255,255,0.5); width: 28px; height: 28px; border-radius: 6px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0; font-size: 0.75rem;
    }
    .sb-toggle:hover { background: rgba(255,255,255,0.1); color: #00c6ff; }

    /* Nav */
    .sb-nav { flex: 1; padding: 18px 10px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; }
    .sb-section {
      font-size: 0.62rem; font-weight: 800; color: rgba(255,255,255,0.25);
      text-transform: uppercase; letter-spacing: 1.5px;
      padding: 10px 10px 4px;
    }
    .sb-link {
      display: flex; align-items: center; gap: 13px;
      padding: 11px 14px; border-radius: 10px;
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-weight: 600; font-size: 0.875rem; white-space: nowrap;
      transition: all 0.2s ease; cursor: pointer;
    }
    .sb-link i { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
    .sb-link:hover { background: rgba(255,255,255,0.05); color: #fff; padding-left: 18px; }
    .sb-link.active {
      background: linear-gradient(135deg, rgba(0,198,255,0.15) 0%, rgba(0,114,255,0.1) 100%);
      color: #fff; border-left: 3px solid #00c6ff; padding-left: 11px;
    }

    /* Footer */
    .sb-footer { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 12px; }
    .sb-user { display: flex; align-items: center; gap: 10px; }
    .sb-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.8rem; color: #fff; flex-shrink: 0;
    }
    .sb-user-info { display: flex; flex-direction: column; overflow: hidden; }
    .sb-username { font-weight: 700; font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-role { font-size: 0.7rem; color: #00c6ff; font-weight: 600; }
    .sb-logout {
      background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.2);
      color: #ff4757; border-radius: 8px; padding: 8px 14px;
      font-size: 0.8rem; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: all 0.2s;
    }
    .sb-logout:hover { background: #ff4757; color: #fff; box-shadow: 0 4px 12px rgba(255,71,87,0.25); }

    .sb-footer-mini { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: center; }
    .sb-logout-mini {
      background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.2);
      color: #ff4757; border-radius: 8px; width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
    }
    .sb-logout-mini:hover { background: #ff4757; color: #fff; }

    @media (max-width: 768px) { .sidebar { width: 72px; } .sb-brand-name, .sb-section, .sb-footer { display: none; } }
  `]
})
export class SidebarComponent {
  private router = inject(Router);
  @Input() role: string | null = '';
  @Input() username: string = '';
  collapsed = false;

  getInitials() {
    return this.username ? this.username.substring(0, 2).toUpperCase() : 'U';
  }

  logout() {
    localStorage.removeItem('ega_token');
    localStorage.removeItem('ega_role');
    localStorage.removeItem('ega_clientId');
    this.router.navigate(['/login']);
  }
}
