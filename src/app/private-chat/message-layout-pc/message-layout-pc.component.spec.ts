import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageLayoutPcComponent } from './message-layout-pc.component';

describe('MessageLayoutPcComponent', () => {
  let component: MessageLayoutPcComponent;
  let fixture: ComponentFixture<MessageLayoutPcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageLayoutPcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessageLayoutPcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
