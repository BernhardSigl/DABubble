import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPopupComponent } from './policy-popup.component';

describe('PolicyPopupComponent', () => {
  let component: PolicyPopupComponent;
  let fixture: ComponentFixture<PolicyPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolicyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
