import { TestBed } from '@angular/core/testing';

import { GetIdService } from './get-id.service';

describe('GetIdService', () => {
  let service: GetIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
