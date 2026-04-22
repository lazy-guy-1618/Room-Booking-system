export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}
