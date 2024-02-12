import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMembersComponent } from './list-members.component';

describe('ListMembersComponent', () => {
  let component: ListMembersComponent;
  let fixture: ComponentFixture<ListMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
