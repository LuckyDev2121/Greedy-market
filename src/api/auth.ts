import axios from "axios";
import { INTRO_API_URL } from "../config/gameConfig";
export type IntroResponse = {
  status: boolean;
  user_id?: number;
};

export const checkIntroIntegration = async (
  userId: number,
  token: number
): Promise<IntroResponse> => {
  const response = await axios.post(`${INTRO_API_URL}`, {
    userid: userId,
    token: token,
  });

  return response.data;
};