import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAvaterComponent } from './choose-avater.component';

describe('ChooseAvaterComponent', () => {
  let component: ChooseAvaterComponent;
  let fixture: ComponentFixture<ChooseAvaterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseAvaterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseAvaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
