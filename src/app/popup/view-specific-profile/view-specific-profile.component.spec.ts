import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSpecificProfileComponent } from './view-specific-profile.component';

describe('ViewSpecificProfileComponent', () => {
  let component: ViewSpecificProfileComponent;
  let fixture: ComponentFixture<ViewSpecificProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSpecificProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSpecificProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
