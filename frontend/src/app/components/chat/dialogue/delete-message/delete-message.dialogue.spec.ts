import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMessageDialog } from './delete-message.dialogue';

describe('DeleteMessageComponent', () => {
  let component: DeleteMessageDialog;
  let fixture: ComponentFixture<DeleteMessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteMessageDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteMessageDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
