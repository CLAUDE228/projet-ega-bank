import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.api.getProfile().pipe(
      map((p: any) => {
        if (p?.role === 'ROLE_ADMIN') return true;
        this.router.navigate(['/']);
        return false;
      }),
      catchError(() => { this.router.navigate(['/']); return of(false); })
    );
  }
}
