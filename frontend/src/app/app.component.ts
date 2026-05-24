import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  splash = true;
  private readonly router = inject(Router);

  get isLoggedIn(): boolean { return !!localStorage.getItem('ega_token'); }
  get role(): string | null { return localStorage.getItem('ega_role'); }
  get clientId(): number | null {
    const cid = localStorage.getItem('ega_clientId');
    return cid ? Number(cid) : null;
  }

  logout(): void {
    localStorage.removeItem('ega_token');
    localStorage.removeItem('ega_role');
    localStorage.removeItem('ega_clientId');
    this.router.navigate(['/login']).catch(() => {});
  }

  constructor() {
    setTimeout(() => this.splash = false, 1800);
  }
}
