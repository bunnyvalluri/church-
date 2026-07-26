import * as lucideReact from 'lucide-react';

const icons = [
  'Menu', 'X', 'Phone', 'ChevronRight', 
  'Facebook', 'Instagram', 'Youtube', 'Twitter',
  'ArrowUp', 'ArrowRight', 'Book', 'Check', 'Heart', 'Cross'
];

for (const name of icons) {
  console.log(`${name}:`, typeof lucideReact[name]);
}
