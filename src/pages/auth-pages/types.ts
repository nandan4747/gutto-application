export interface RegisterData {
  username: string;
  fullname: string;
  password: string;
  accountType?: "private" | "public";
}
export interface LoginData {
  username: string;
  password: string;
}
