import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import {MatDividerModule} from '@angular/material/divider';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('textAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-350px)' })),
      state(
        'small',
        style({ opacity: 1, transform: 'translateX(0) scale(0.4)' })
      ),
      transition('visible => small', animate('0.5s ease-out')),
      transition('hidden => visible', [
        animate('1.3s ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideAnimation', [
      state('middle', style({ transform: 'translateX(200px)' })),
      state('left', style({ transform: 'translateX(0)' })),
      state('small', style({ transform: 'translateX(0) scale(0.4)' })), // scale down to 50%
      transition('left => small', animate('0.5s ease-out')),
      transition('middle => left', animate('0.5s ease-in')),
    ]),
    trigger('backgroundAnimation', [
      state('initial', style({ opacity: 1 })),
      state('mid', style({ opacity: 0.5 })),
      state('final', style({ opacity: 0 })),
      transition('initial => mid', animate('0.5s ease-in')),
      transition('mid => final', animate('0.2s ease-in')),
    ]),
    trigger('moveAnimation', [
      state('middle', style({ transform: 'translate(-50%, -50%) ' })),
      state(
        'top-left',
        style({
          top: '0',
          left: '0',
          fontSize: '32px',
          transform: 'scale(0.4)',
        })
      ),
      transition('middle => top-left', animate('0.6s ease-out')),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  textState: string = 'hidden';
  svgTransform: string = 'middle';
  backgroundState: string = 'initial';
  setNone: boolean = false;
  moveState: string = 'middle';
  animationPlayed: boolean = false;

  ngOnInit(): void {
    if (!this.animationPlayed) {
      this.playAnimation();
    }
  }

  playAnimation() {
    this.textState = 'hidden';
    setTimeout(() => {
      this.svgTransform = 'left';
    }, 500);
    setTimeout(() => {
      this.textState = 'visible';
    }, 1000);
    setTimeout(() => {
      this.moveState = 'top-left';
    }, 2600);
    setTimeout(() => {
      this.backgroundState = 'mid';
    }, 2700);
    setTimeout(() => {
      this.backgroundState = 'final';
      this.setNone = true;
      this.svgTransform = 'small';
      this.textState = 'small';
    }, 2900);
    this.animationPlayed = true;
  }
}
