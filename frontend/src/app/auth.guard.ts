import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.api.getProfile().pipe(
      map(() => true),
      catchError(() => {
        localStorage.removeItem('ega_token');
        localStorage.removeItem('ega_role');
        localStorage.removeItem('ega_clientId');
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
