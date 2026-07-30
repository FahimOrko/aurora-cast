type ApiSuccessResponse<T> = {
  success: true;
  code: number;
  message: string;
  data: T | null;
};

type ApiErrorResponse = {
  success: false;
  code: number;
  errorMessage: string;
};

export const formatResponseSuccess = <T>(
  message: string,
  code = 200,
  apiResponse: T | null = null,
): ApiSuccessResponse<T> => {
  return { success: true, code, message, data: apiResponse };
};

export const formatResponseError = (
  errorMessage: string,
  code = 500,
): ApiErrorResponse => {
  return { success: false, code, errorMessage };
};
