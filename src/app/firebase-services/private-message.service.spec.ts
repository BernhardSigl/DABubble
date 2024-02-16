import { TestBed } from '@angular/core/testing';

import { PrivateMessageService } from './private-message.service';

describe('PrivateMessageService', () => {
  let service: PrivateMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
