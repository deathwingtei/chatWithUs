import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function sendNotification(message: string): Promise<any> {
  const token = process.env.LINE_NOTIFY_TOKEN;
  const url = "https://notify-api.line.me/api/notify";

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${token}`,
  };

  const data = new URLSearchParams();
  data.append("message", message);

  try {
    const response = await axios.post(url, data, { headers });
    const result = response.data;
    return result;
  } catch (error: any) {
    console.error("error:", error.message);
    throw error;
  }
}

export default sendNotification;
