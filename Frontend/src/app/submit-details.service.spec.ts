import { TestBed } from '@angular/core/testing';

import { SubmitDetailsService } from './submit-details.service';

describe('SubmitDetailsService', () => {
  let service: SubmitDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmitDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
