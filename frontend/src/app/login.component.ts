import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="lp-wrapper">
      <!-- LEFT: Branding Panel -->
      <div class="lp-left">
        <div class="lp-left-overlay">
          <div class="lp-brand">
            <div class="lp-brand-icon">
              <i class="fas fa-university"></i>
            </div>
            <h1>EGA BANK</h1>
            <p class="lp-tagline">Secure Digital Banking Platform</p>
          </div>
          <div class="lp-features">
            <div class="lp-feat"><i class="fas fa-shield-alt"></i> Sécurité bancaire de niveau entreprise</div>
            <div class="lp-feat"><i class="fas fa-bolt"></i> Transactions instantanées 24h/24</div>
            <div class="lp-feat"><i class="fas fa-globe"></i> Couverture nationale complète</div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Auth Forms -->
      <div class="lp-right">
        <div class="lp-card">

          <!-- Tabs -->
          <div class="lp-tabs">
            <button (click)="tab = 'login'" [class.lp-tab-active]="tab === 'login'" class="lp-tab">
              <i class="fas fa-sign-in-alt"></i> Connexion
            </button>
            <button (click)="tab = 'register'" [class.lp-tab-active]="tab === 'register'" class="lp-tab">
              <i class="fas fa-user-plus"></i> Inscription
            </button>
          </div>

          <!-- LOGIN -->
          <form *ngIf="tab === 'login'" [formGroup]="loginForm" (ngSubmit)="login()" class="lp-form fade-in">
            <div class="lp-form-title">
              <h2>Bon retour !</h2>
              <p>Connectez-vous à votre espace bancaire sécurisé.</p>
            </div>

            <div class="lp-field">
              <label class="ega-label">Nom d'utilisateur</label>
              <div class="lp-input-wrap">
                <i class="fas fa-user"></i>
                <input class="ega-input" formControlName="username" type="text" placeholder="Entrez votre identifiant">
              </div>
            </div>

            <div class="lp-field">
              <label class="ega-label">Mot de passe</label>
              <div class="lp-input-wrap">
                <i class="fas fa-lock"></i>
                <input class="ega-input" formControlName="password" type="password" placeholder="••••••••">
              </div>
            </div>

            <div *ngIf="errorMsg" class="lp-error">
              <i class="fas fa-exclamation-triangle"></i> {{ errorMsg }}
            </div>

            <button type="submit" class="btn-ega-primary lp-btn-submit" [disabled]="loginForm.invalid || loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!loading" class="fas fa-sign-in-alt"></i>
              {{ loading ? 'Connexion...' : 'Accéder à mon espace' }}
            </button>
          </form>

          <!-- REGISTER -->
          <form *ngIf="tab === 'register'" [formGroup]="registerForm" (ngSubmit)="register()" class="lp-form fade-in">
            <div class="lp-form-title">
              <h2>Créer un compte</h2>
              <p>Rejoignez la communauté EGA Bank aujourd'hui.</p>
            </div>

            <div class="lp-field">
              <label class="ega-label">Nom d'utilisateur</label>
              <div class="lp-input-wrap">
                <i class="fas fa-user"></i>
                <input class="ega-input" formControlName="username" type="text" placeholder="Choisissez un identifiant">
              </div>
            </div>

            <div class="lp-field">
              <label class="ega-label">Mot de passe</label>
              <div class="lp-input-wrap">
                <i class="fas fa-lock"></i>
                <input class="ega-input" formControlName="password" type="password" placeholder="Minimum 4 caractères">
              </div>
            </div>

            <div class="lp-field">
              <label class="ega-label">Confirmer le mot de passe</label>
              <div class="lp-input-wrap">
                <i class="fas fa-check-circle"></i>
                <input class="ega-input" formControlName="confirm" type="password" placeholder="Répétez le mot de passe">
              </div>
            </div>

            <div *ngIf="errorMsg" class="lp-error">
              <i class="fas fa-exclamation-triangle"></i> {{ errorMsg }}
            </div>

            <button type="submit" class="btn-ega-electric lp-btn-submit" [disabled]="registerForm.invalid || loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!loading" class="fas fa-user-plus"></i>
              {{ loading ? 'Inscription...' : "Finaliser l'inscription" }}
            </button>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .lp-wrapper { display: flex; height: 100vh; overflow: hidden; font-family: 'Inter', sans-serif; }

    /* LEFT PANEL */
    .lp-left {
      flex: 1.1;
      background: linear-gradient(160deg, #001226 0%, #001f3f 40%, #003366 100%),
                  url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=70');
      background-blend-mode: overlay; background-size: cover; background-position: center;
      position: relative; overflow: hidden;
    }
    .lp-left::after {
      content: ''; position: absolute; top: -30%; right: -20%;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(0,198,255,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .lp-left-overlay {
      position: relative; z-index: 2; height: 100%;
      display: flex; flex-direction: column; justify-content: center;
      padding: 60px 70px; color: #fff;
    }
    .lp-brand-icon {
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.08); border: 1.5px solid rgba(0,198,255,0.4);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
    }
    .lp-brand-icon i { font-size: 2rem; color: #00c6ff; }
    .lp-brand h1 { font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
    .lp-tagline { color: rgba(255,255,255,0.55); font-size: 0.95rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 50px; }
    .lp-features { display: flex; flex-direction: column; gap: 18px; }
    .lp-feat { display: flex; align-items: center; gap: 14px; font-size: 0.9rem; color: rgba(255,255,255,0.8); font-weight: 500; }
    .lp-feat i { color: #00c6ff; font-size: 1rem; width: 20px; text-align: center; }

    /* RIGHT PANEL */
    .lp-right {
      width: 480px; background: #f0f4f8;
      display: flex; align-items: center; justify-content: center; padding: 30px;
      overflow-y: auto;
    }
    .lp-card {
      background: #fff; border-radius: 20px; padding: 36px 32px;
      box-shadow: 0 20px 60px rgba(0,33,68,0.1); width: 100%;
      border: 1px solid rgba(0,33,68,0.06);
    }

    /* TABS */
    .lp-tabs { display: flex; background: #f0f4f8; border-radius: 12px; padding: 4px; gap: 4px; margin-bottom: 28px; }
    .lp-tab { flex: 1; padding: 10px; background: transparent; border: none; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.85rem; color: #6c757d; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.2s ease; }
    .lp-tab:hover { background: rgba(255,255,255,0.6); color: #001f3f; }
    .lp-tab.lp-tab-active { background: #fff; color: #001f3f; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

    /* FORM */
    .lp-form { display: flex; flex-direction: column; gap: 18px; }
    .lp-form-title h2 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: #001226; margin-bottom: 4px; }
    .lp-form-title p { color: #6c757d; font-size: 0.85rem; }
    .lp-field { display: flex; flex-direction: column; gap: 7px; }
    .lp-input-wrap { position: relative; display: flex; align-items: center; }
    .lp-input-wrap i { position: absolute; left: 14px; color: #6c757d; font-size: 0.9rem; z-index: 1; }
    .lp-input-wrap .ega-input { padding-left: 40px; }
    .lp-error { background: rgba(255,71,87,0.08); border: 1px solid rgba(255,71,87,0.25); border-radius: 10px; padding: 10px 14px; color: #c0392b; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
    .lp-btn-submit { width: 100%; padding: 13px; font-size: 0.9rem; justify-content: center; }

    /* Responsive */
    @media (max-width: 900px) { .lp-left { display: none; } .lp-right { width: 100%; } }
    @media (max-width: 480px) { .lp-right { padding: 16px; } .lp-card { padding: 24px 20px; } }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  tab: 'login' | 'register' = 'login';
  loading = false;
  errorMsg = '';

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    confirm: ['', [Validators.required]]
  });

  login() {
    if (this.loginForm.invalid) return;
    this.loading = true; this.errorMsg = '';
    this.api.login(this.loginForm.getRawValue()).subscribe({
      next: r => {
        // store token and clientId immediately if backend returned it
        localStorage.setItem('ega_token', r.token);
        if (r.clientId) localStorage.setItem('ega_clientId', String(r.clientId));
        // still fetch profile to get authoritative role/username
        this.api.getProfile().subscribe(p => {
          localStorage.setItem('ega_role', p.role);
          if (p.clientId) localStorage.setItem('ega_clientId', String(p.clientId));
          this.loading = false;
          this.router.navigate([p.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/user/dashboard']);
        }, () => {
          // fallback navigation if /me fails
          this.loading = false;
          this.router.navigate(['/user/dashboard']);
        });
      },
      error: e => { this.loading = false; this.errorMsg = e?.error?.message ?? 'Identifiants incorrects.'; }
    });
  }

  register() {
    if (this.registerForm.invalid) return;
    const { username, password, confirm } = this.registerForm.getRawValue();
    if (password !== confirm) { this.errorMsg = 'Les mots de passe ne correspondent pas.'; return; }
    this.loading = true; this.errorMsg = '';
    this.api.register({ username, password }).subscribe({
      next: () => {
        this.api.login({ username, password }).subscribe({
          next: r => {
            localStorage.setItem('ega_token', r.token);
            if (r.clientId) localStorage.setItem('ega_clientId', String(r.clientId));
            this.api.getProfile().subscribe(p => {
              localStorage.setItem('ega_role', p.role);
              if (p.clientId) localStorage.setItem('ega_clientId', String(p.clientId));
              this.loading = false;
              this.router.navigate([p.role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/user/dashboard']);
            }, () => {
              this.loading = false;
              this.router.navigate(['/user/dashboard']);
            });
          }
        });
      },
      error: e => { this.loading = false; this.errorMsg = e?.error?.message ?? "Ce nom d'utilisateur existe déjà."; }
    });
  }
}
