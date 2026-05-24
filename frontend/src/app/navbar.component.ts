import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="nb-bar">
      <div class="nb-left">
        <h2 class="nb-page-title">{{ pageTitle }}</h2>
        <span class="nb-breadcrumb" *ngIf="breadcrumb">/ {{ breadcrumb }}</span>
      </div>
      <div class="nb-right">
        <div class="nb-time">
          <i class="fas fa-clock"></i>
          {{ now | date:'HH:mm' }} — {{ now | date:'dd/MM/yyyy' }}
        </div>
        <div class="nb-notif">
          <button class="nb-icon-btn" title="Notifications">
            <i class="fas fa-bell"></i>
            <span class="nb-badge">1</span>
          </button>
        </div>
        <div class="nb-profile-chip">
          <div class="nb-chip-avatar">{{ getInitials() }}</div>
          <span class="nb-chip-name">{{ username || 'Utilisateur' }}</span>
          <span class="nb-chip-role">{{ role === 'ROLE_ADMIN' ? 'Admin' : 'Client' }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nb-bar {
      height: 65px;
      background: #fff;
      border-bottom: 1px solid rgba(0,33,68,0.07);
      display: flex; align-items: center;
      padding: 0 28px; gap: 20px;
      position: sticky; top: 0; z-index: 50;
      box-shadow: 0 2px 12px rgba(0,33,68,0.05);
    }
    .nb-left { display: flex; align-items: center; gap: 8px; flex: 1; }
    .nb-page-title { font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 700; color: #001226; margin: 0; }
    .nb-breadcrumb { color: #6c757d; font-size: 0.875rem; }
    .nb-right { display: flex; align-items: center; gap: 16px; }
    .nb-time { display: flex; align-items: center; gap: 7px; font-size: 0.8rem; color: #6c757d; font-weight: 500; background: #f0f4f8; padding: 6px 12px; border-radius: 20px; }
    .nb-time i { color: #003366; font-size: 0.75rem; }
    .nb-icon-btn { background: #f0f4f8; border: none; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #001226; position: relative; transition: all 0.2s; }
    .nb-icon-btn:hover { background: #001f3f; color: #fff; }
    .nb-badge { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; background: #ff4757; border-radius: 50%; border: 1.5px solid #fff; }
    .nb-profile-chip { display: flex; align-items: center; gap: 10px; background: #001226; color: #fff; padding: 6px 14px 6px 6px; border-radius: 40px; }
    .nb-chip-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00c6ff, #0072ff); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: #fff; flex-shrink: 0; }
    .nb-chip-name { font-weight: 700; font-size: 0.82rem; color: #fff; }
    .nb-chip-role { font-size: 0.7rem; color: #00c6ff; font-weight: 600; padding: 2px 8px; background: rgba(0,198,255,0.1); border-radius: 20px; }
    @media (max-width: 600px) { .nb-time, .nb-notif { display: none; } }
  `]
})
export class NavbarComponent {
  @Input() pageTitle: string = 'Dashboard';
  @Input() breadcrumb: string = '';
  @Input() username: string = '';
  @Input() role: string | null = '';

  now = new Date();

  constructor() {
    setInterval(() => this.now = new Date(), 60000);
  }

  getInitials() {
    return this.username ? this.username.substring(0, 2).toUpperCase() : 'U';
  }
}
