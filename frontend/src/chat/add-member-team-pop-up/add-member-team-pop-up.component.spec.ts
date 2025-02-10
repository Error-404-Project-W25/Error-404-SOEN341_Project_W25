import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberTeamPopUpComponent } from './add-member-team-pop-up.component';

describe('AddMemberTeamPopUpComponent', () => {
  let component: AddMemberTeamPopUpComponent;
  let fixture: ComponentFixture<AddMemberTeamPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberTeamPopUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMemberTeamPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
