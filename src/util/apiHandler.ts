import env from "../util/validateEnv";
import { DeleteMediaResponse, errorMediaResponse, ErrorResponse, ListBody, mediaResponse, SingleList } from "./types";
import fs from 'fs';
import FormData from 'form-data';
import { memoryManager } from "../routes/memoryManager";
import { SESSION_KEYS } from "../constants";
import axios, { AxiosResponse } from "axios";


const token=env.TOKEN;
const version=env.VERSION;
const phone_no_id=env.PHONE_NO_ID;


const axiosConfig = {
  headers: {
    "Content-Type": "application/json",
  },
};
//# This is for sending Text Messages
export async function sendTextMessage(to: string,msg:string): Promise<boolean> {
    try {
        // Make the Axios request to send the message
        await axios.post(`https://graph.facebook.com/${version}/${phone_no_id}/messages?access_token=${token}`, {
            messaging_product: "whatsapp",
            to: to,
            text:{
                body:""+msg
            }
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        // If the request is successful, return true
        return true;
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error sending message:", error);
        return false;
    }
}


//# This is for sending Text Messages
export async function sendMarkAsRead(MsgId: string): Promise<boolean> {
    try {
        // Make the Axios request to send the message
        await axios.post(`https://graph.facebook.com/${version}/${phone_no_id}/messages?access_token=${token}`, {
            messaging_product: "whatsapp",
            status: "read",
            message_id: MsgId
            }, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        // If the request is successful, return true
        return true;
    } catch (error) {
        // If an error occurs, log it and return false
        console.error("Error sending message:", error);
        return false;
    }
}


//media messages
export async function uploadMediaFile(filePath: string): Promise<any> {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', fs.createReadStream(filePath));
  
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://graph.facebook.com/${version}/${phone_no_id}/media`,
      headers: {
        'Authorization': 'Bearer ' +token,
        'Cookie': 'ps_l=1; ps_n=1',
        'content-type': 'multipart/form-data',
        ...formData.getHeaders()
      },
      data: formData
    };
  
    try {
      const response = await axios.request(config);
      console.log(response.data);
      return response.data;

    } catch (error) {
      console.log(error);
      return error;
    }
}

export async function getMediaURLFromMediaID(mediaId: string): Promise<mediaResponse|errorMediaResponse> {
    try {
        const response = await axios.get(`https://graph.facebook.com/${version}/${mediaId}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
         });

         // Check if the response contains the expected fields
        if ('url' in response.data) {
            return response.data as mediaResponse;
        } else {
            return { error: "Unexpected response format" };
        }

    } catch (error) {
        // If an error occurs, log it and return a structured error response
        console.error("Error getting media link:", error);

        // Type assertion for AxiosError
        if (axios.isAxiosError(error)) {
            return { error: error.response?.data?.error || "Media not found" };
        } else {
            return { error: "An unknown error occurred" };
        }
    }
}

  //getMediaURLFromMediaURL
export async function downloadMediaFromURL(mediaUrl: string): Promise<any> {
    try {
  
        const mediaResponse = await axios.get(mediaUrl, {
          headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${token}`
          },
          responseType: 'arraybuffer',
          responseEncoding: 'binary'
  
      });
  
      console.log("data # ",mediaResponse.data);
      return mediaResponse.data;
  
      } catch (error) {
         // If an error occurs, log it and return a server error
         console.error('Error downloadMediaFromURL ', error);
         return error;
      }
}



type DeleteMediaResult = DeleteMediaResponse | ErrorResponse;

export async function deleteMediaUsingId(mediaId: string): Promise<DeleteMediaResult> {
    try {
        const response = await axios.delete(`https://graph.facebook.com/${version}/${mediaId}`, {
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
        });

        console.log("data # ", response.data);
        return response.data as DeleteMediaResponse;

    } catch (error) {
        // If an error occurs, log it and return a structured error response
        console.error('Error deleting media:', error);

        // Type assertion for AxiosError
        if (axios.isAxiosError(error)) {
            return { error: error.response?.data?.error || 'Failed to delete media' };
        } else {
            return { error: 'An unknown error occurred' };
        }
    }
}


//olu api calls
export const sendTextMessages = async (
  to: string,
  msg: any
): Promise<boolean> => {
  //     console.error("# msg #", msg);
  let bodyContent = typeof msg === "string" ? msg : JSON.stringify(msg);
  if (typeof msg === "object" && msg.body) {
    bodyContent = msg.body.question || "";
  }
  if (!bodyContent) {
    console.error("Error: text body content is empty.");
    return false;
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    text: {
      body: bodyContent, // Ensure body is a string and not empty
    },
  };
  return sendMessage(to, payload);
};

const sendMessage = async (to: string, payload: object): Promise<boolean> => {
  try {
    console.log("Payload being sent:", JSON.stringify(payload, null, 2)); // Detailed payload logging
    await axios.post(
      `https://graph.facebook.com/${version}/${phone_no_id}/messages?access_token=${token}`,
      payload,
      axiosConfig
    );
    return true;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error sending message:", error.response.data);
    } else if (error instanceof Error) {
      console.error("Error sending message:", error.message);
    } else {
      console.error("Unknown error sending message:", error);
    }
    return false;
  }
};


export const sendInteractiveMessage = async (
  to: string,
  body: any,
  buttons: any[]
): Promise<boolean> => {
  let bodyContent = typeof body === "string" ? body : JSON.stringify(body);
  if (typeof body === "object" && body.body) {
    bodyContent = body.body.question || "";
  }
  if (!bodyContent) {
    console.error("Error: interactive body content is empty.");
    return false;
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: bodyContent, // Ensure body is a string and not empty
      },
      action: {
        buttons,
      },
    },
  };
  return sendMessage(to, payload);
};

const callChatbotAPI = async (url: string, body: object): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.post(
      url,
      body,
      axiosConfig
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Error occurred:", error.response.data);
    } else if (error instanceof Error) {
      console.error("Error occurred:", error.message);
    } else {
      console.error("Unknown error occurred:", error);
    }
    return null;
  }
};

export const getSentimentResponse = async (
  bodyParam: any,
  question: string,
  context: any
): Promise<{
  sentiment: string;
  header: string;
  answer: string;
  buttons: any[];
  data: any[];
  footer: string;
}> => {
  const url = "https://chatbot-flask-olu-3e3ef61e091f.herokuapp.com/sentiment";
  let parsedBody: any;
  if (typeof bodyParam === "string") {
    try {
      parsedBody = JSON.parse(bodyParam);
    } catch (error) {
      console.error("Error parsing bodyParam:", error);
      return {
        sentiment: "",
        header: "",
        answer: "",
        buttons: [],
        data: [],
        footer: "",
      };
    }
  } else {
    parsedBody = bodyParam;
  }

  const extractedBody =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
      ?.question || "";
  const phoneNo =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

  if (!extractedBody || !phoneNo) {
    console.error("Error: extractedBody or phoneNo is empty.");
    return {
      sentiment: "",
      header: "",
      answer: "",
      buttons: [],
      data: [],
      footer: "",
    };
  }

  let sentiment =
    (await memoryManager.get(phoneNo, SESSION_KEYS.SENTIMENT)) || "";
  let service = (await memoryManager.get(phoneNo, SESSION_KEYS.SERVICE)) || "";
  let sessionId =
    (await memoryManager.get(phoneNo, SESSION_KEYS.SESSION_ID)) || "";
  let keys = (await memoryManager.get(phoneNo, SESSION_KEYS.KEY)) || "";
  let tokens = (await memoryManager.get(phoneNo, SESSION_KEYS.TOKEN)) || "";

  const body = {
    question: extractedBody,
    sentiment: sentiment,
    contact: phoneNo,
    service: service,
    session: sessionId,
    key: keys,
    token: tokens,
    context,
  };

  const responseData = await callChatbotAPI(url, body);
  if (responseData && responseData.answer) {
    const sentimentData = responseData.data || [];
    const sentimentButton = responseData.answer.button || []; // Ensure button extraction
    const transformedButtons: any[] = [];
    sentimentButton.forEach((item: any) => {
      transformedButtons.push({
        id: item.id,
        title: item.title,
      });
    });

    return {
      sentiment: responseData.sentiment.toLowerCase(),
      header: responseData.answer.header,
      answer: responseData.answer.text,
      buttons: transformedButtons,
      data: sentimentData,
      footer: responseData.answer.footer,
    };
  } else {
    return {
      sentiment: "",
      header: "",
      answer: "",
      buttons: [],
      data: [],
      footer: "",
    };
  }
};

export const callContextService = async (
  bodyParam: any,
  sentiment: string,
  context: any
): Promise<{
  header: string;
  answer: string;
  buttons: any[];
  data: any[];
  footer: string;
}> => {
  const url = "https://chatbot-flask-olu-3e3ef61e091f.herokuapp.com/context";
  let parsedBody: any;
  if (typeof bodyParam === "string") {
    try {
      parsedBody = JSON.parse(bodyParam);
    } catch (error) {
      console.error("Error parsing bodyParam:", error);
      return {
        header: "",
        answer: "Error parsing bodyParam",
        buttons: [],
        data: [],
        footer: "",
      };
    }
  } else {
    parsedBody = bodyParam;
  }

  const extractedBody =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
      ?.question || "";
  const phoneNo =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

  if (!extractedBody || !phoneNo) {
    console.error("Error: extractedBody or phoneNo is empty.");
    return {
      header: "",
      answer: "Error extracting data",
      buttons: [],
      data: [],
      footer: "",
    };
  }

  let service = (await memoryManager.get(phoneNo, SESSION_KEYS.SERVICE)) || "";
  let sessionId =
    (await memoryManager.get(phoneNo, SESSION_KEYS.SESSION_ID)) || "";
  let keys = (await memoryManager.get(phoneNo, SESSION_KEYS.KEY)) || "";
  let tokens = (await memoryManager.get(phoneNo, SESSION_KEYS.TOKEN)) || "";

  const body = {
    question: extractedBody,
    sentiment: sentiment,
    contact: phoneNo,
    service: service,
    session: sessionId,
    key: keys,
    token: tokens,
    context,
  };

  const responseData = await callChatbotAPI(url, body);
  if (responseData && responseData.answer) {
    const contextData = responseData.data || [];
    const contextButton = responseData.answer.button || []; // Ensure button extraction
    const transformedButtons: any[] = [];
    contextButton.forEach((item: any) => {
      transformedButtons.push({
        id: item.id,
        title: item.title,
      });
    });

    return {
      header: responseData.answer.header,
      answer: responseData.answer.text,
      buttons: transformedButtons,
      data: contextData,
      footer: responseData.answer.footer,
    };
  } else {
    return {
      header: "",
      answer: "Error occurred while calling API",
      buttons: [],
      data: [],
      footer: "",
    };
  }
};

export const getAskResponse = async (
  bodyParam: any,
  sentiment: string,
  context: any
): Promise<{
  header: string;
  answer: string;
  buttons: any[];
  data: any[];
  footer: string;
}> => {
  const url = "https://chatbot-flask-olu-3e3ef61e091f.herokuapp.com/ask";
  let parsedBody: any;
  if (typeof bodyParam === "string") {
    try {
      parsedBody = JSON.parse(bodyParam);
    } catch (error) {
      console.error("Error parsing bodyParam:", error);
      return {
        header: "",
        answer: "Error parsing bodyParam",
        buttons: [],
        data: [],
        footer: "",
      };
    }
  } else {
    parsedBody = bodyParam;
  }

  const extractedBody =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
      ?.question || "";
  const phoneNo =
    parsedBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "";

  if (!extractedBody || !phoneNo) {
    console.error("Error: extractedBody or phoneNo is empty.");
    return {
      header: "",
      answer: "Error extracting data",
      buttons: [],
      data: [],
      footer: "",
    };
  }

  let service = (await memoryManager.get(phoneNo, SESSION_KEYS.SERVICE)) || "";
  let sessionId =
    (await memoryManager.get(phoneNo, SESSION_KEYS.SESSION_ID)) || "";
  let keys = (await memoryManager.get(phoneNo, SESSION_KEYS.KEY)) || "";
  let tokens = (await memoryManager.get(phoneNo, SESSION_KEYS.TOKEN)) || "";

  const body = {
    question: extractedBody,
    sentiment: sentiment,
    contact: phoneNo,
    service: service,
    session: sessionId,
    key: keys,
    token: tokens,
    context,
  };
  //   console.error(" Ask body.", body);
  const responseData = await callChatbotAPI(url, body);
  if (responseData && responseData.answer) {
    const AskData = responseData.data || [];
    const askButton = responseData.answer.button || []; // Ensure button extraction
    const transformedButtons: any[] = [];
    askButton.forEach((item: any) => {
      transformedButtons.push({
        id: item.id,
        title: item.title,
      });
    });

    return {
      header: responseData.answer.header,
      answer: responseData.answer.text,
      buttons: transformedButtons,
      data: AskData,
      footer: responseData.answer.footer,
    };
  } else {
    return {
      header: "",
      answer: "Error occurred while calling API",
      buttons: [],
      data: [],
      footer: "",
    };
  }
};
