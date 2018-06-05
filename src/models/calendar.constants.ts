export const eventColors: selectValueString[] = [
  { value: 'blue', description: 'Blå' },
  { value: 'red', description: 'Rød' },
  { value: 'green', description: 'Grønn' },
  { value: 'brown', description: 'Brun' },
  { value: 'yellow', description: 'Gul' },
  { value: 'orange', description: 'Oransje' },
  { value: 'grey', description: 'Grå' }
];

export const notifications: selectValue[] = [
  { value: 0, description: 'Ingen' },
  { value: 1, description: '5 minutter' },
  { value: 2, description: '15 minutter' },
  { value: 3, description: '30 minutter' },
  { value: 4, description: '1 time' },
  { value: 5, description: '2 timer' }
];

export class selectValueString {
  value: string;
  description: string;
}

export class selectValue {
  value: number;
  description: string;
}
