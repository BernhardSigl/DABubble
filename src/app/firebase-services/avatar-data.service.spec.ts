import { TestBed } from '@angular/core/testing';

import { AvatarDataService } from './avatar-data.service';

describe('AvatarDataService', () => {
  let service: AvatarDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
