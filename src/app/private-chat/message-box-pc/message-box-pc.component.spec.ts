import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageBoxPcComponent } from './message-box-pc.component';

describe('MessageBoxPcComponent', () => {
  let component: MessageBoxPcComponent;
  let fixture: ComponentFixture<MessageBoxPcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBoxPcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageBoxPcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
