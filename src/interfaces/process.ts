import { UUID } from 'crypto';

export interface Process {
  id: UUID;
  modal: boolean;
  name: string;
  step: number | undefined;
  max: number | undefined;
}
