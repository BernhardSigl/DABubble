import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributeMessageComponent } from './distribute-message.component';

describe('DistributeMessageComponent', () => {
  let component: DistributeMessageComponent;
  let fixture: ComponentFixture<DistributeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributeMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
