import { TestBed } from '@angular/core/testing';

import { AuthyService } from './authy.service';

describe('AuthyService', () => {
  let service: AuthyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
