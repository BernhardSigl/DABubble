import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageLayoutComponent } from './message-layout.component';

describe('MessageLayoutComponent', () => {
  let component: MessageLayoutComponent;
  let fixture: ComponentFixture<MessageLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
