export type ErrorResponse = {
  code: number;
  message: string;
  removeUser?: boolean;
};

export type DefaultResponse = {
  success: boolean;
  message?: string;
  error?: ErrorResponse;
  content?: never;
};

export type ApiResponse<TContent> = Omit<DefaultResponse, 'content'> & {
  content?: TContent;
};
