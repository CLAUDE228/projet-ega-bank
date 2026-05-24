import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, BankTransaction, Client, LoginResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  login(payload: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: { username: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  getProfile() {
    return this.http.get<{ username: string; role: string; clientId: number | null }>(`${this.baseUrl}/auth/me`);
  }

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts/me`);
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  createClient(payload: unknown): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, payload);
  }

  updateClient(id: number, payload: unknown): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, payload);
  }

  deleteClient(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  createAccount(payload: unknown): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, payload);
  }
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  deposit(accountId: number, payload: unknown): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/${accountId}/deposit`, payload);
  }

  withdraw(accountId: number, payload: unknown): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/${accountId}/withdraw`, payload);
  }

  transfer(payload: unknown): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/accounts/transfer`, payload);
  }

  getTransactions(accountId: number, start: string, end: string): Observable<BankTransaction[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/accounts/${accountId}/transactions`, { params });
  }

  downloadStatement(accountId: number, start: string, end: string): Observable<Blob> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get(`${this.baseUrl}/accounts/${accountId}/statement`, {
      params,
      responseType: 'blob'
    });
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/by-number/${encodeURIComponent(accountNumber)}`);
  }

  getAllTransactions(params?: { accountId?: number; start?: string; end?: string }) {
    let httpParams = new HttpParams();
    if (params?.accountId) httpParams = httpParams.set('accountId', String(params.accountId));
    if (params?.start) httpParams = httpParams.set('start', params.start);
    if (params?.end) httpParams = httpParams.set('end', params.end);
    return this.http.get<BankTransaction[]>(`${this.baseUrl}/transactions`, { params: httpParams });
  }
}
