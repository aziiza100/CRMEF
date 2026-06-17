import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, AuthResponse } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate user and save token on login', () => {
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token',
      user: { id: 1, name: 'Test User', role: 'admin' }
    };

    service.login('test@crmef.com', 'password').subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('crmef_admin_token')).toBe('mock-jwt-token');
    });

    const req = httpMock.expectOne('http://localhost:8000/api/login'); // URL from environment.apiUrl
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('crmef_admin_token', 'active-token');
    
    service.logout().subscribe(() => {
      expect(localStorage.getItem('crmef_admin_token')).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8000/api/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should handle role storage correctly', () => {
    service.setUserRole('enseignant');
    expect(service.getUserRole()).toBe('enseignant');
  });
});
