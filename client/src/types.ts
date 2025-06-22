export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Comment {
  _id: string;
  text: string;
  createdBy: User;
  createdAt: string;
}

export interface Doubt {
  _id: string;
  title: string;
  description: string;
  createdBy: User;
  createdAt: string;
  commentCount: number;
  tags?: string[];
  imageUrl?: string;
}
