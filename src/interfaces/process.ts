import { UUID } from 'crypto';

export interface Process {
  id: UUID;
  modal: boolean;
  name: string;
  finished: boolean;
  step: number | undefined;
  max: number | undefined;
  error: string | null;
}
