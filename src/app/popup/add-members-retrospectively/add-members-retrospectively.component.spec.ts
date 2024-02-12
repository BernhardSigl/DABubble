import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersRetrospectivelyComponent } from './add-members-retrospectively.component';

describe('AddMembersRetrospectivelyComponent', () => {
  let component: AddMembersRetrospectivelyComponent;
  let fixture: ComponentFixture<AddMembersRetrospectivelyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersRetrospectivelyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMembersRetrospectivelyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
