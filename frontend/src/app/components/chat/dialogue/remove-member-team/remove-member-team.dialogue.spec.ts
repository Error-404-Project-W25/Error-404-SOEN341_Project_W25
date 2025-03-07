import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMemberRemovalDialog } from './remove-member-team.dialogue';

describe('RemoveMemberTeamPopUpComponent', () => {
  let component: TeamMemberRemovalDialog;
  let fixture: ComponentFixture<TeamMemberRemovalDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMemberRemovalDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamMemberRemovalDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
