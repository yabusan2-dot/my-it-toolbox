import { animate } from 'https://esm.sh/animejs';

const animation = animate('img', {
  x: '500px',
  y: '300px',
  scale: [1.0, 1.5, 1.0],
  rotate: '1turn',
  loop:true
})