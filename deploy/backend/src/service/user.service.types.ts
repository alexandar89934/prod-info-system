export type Admin = {
  id: string;
  username: string;
  password: string;
  name: string;
  lastPasswordReset: string;
};

export type User = {
  picture: string;
  name: string;
  id: string;
  employeeNumber: string;
  password: string;
  lastPasswordReset: string;
};
