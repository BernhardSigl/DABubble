import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageLayoutThreadComponent } from './message-layout-thread.component';

describe('MessageLayoutThreadComponent', () => {
  let component: MessageLayoutThreadComponent;
  let fixture: ComponentFixture<MessageLayoutThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageLayoutThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageLayoutThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
