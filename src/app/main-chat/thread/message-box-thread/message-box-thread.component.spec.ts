import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageBoxThreadComponent } from './message-box-thread.component';

describe('MessageBoxThreadComponent', () => {
  let component: MessageBoxThreadComponent;
  let fixture: ComponentFixture<MessageBoxThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBoxThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageBoxThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
