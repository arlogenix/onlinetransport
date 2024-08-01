import { sendTextMessages, getSentimentResponse, callContextService, getAskResponse } from "../util/apiHandler";
import { memoryManager } from "../routes/memoryManager";
import { isValidEmail, isFullName } from "../util/validator";
import { SESSION_KEYS } from "../constants";

interface Message {
    question: string;
    sentiment: string;
    contact: string;
    service: string;
    session: string;
    key: string;
    token: string;
    context: {
        firstname: string;
        lastname: string;
        email: string;
        phoneno: string;
        ip: string;
    };
}

export const handleUserRegistration = async (
    phoneNo: string,
    textMessage: Message,
    sentiment: string,
    service: string,
    bodyParam: any,
    context: any,  // Changed 'Context' to 'context' to avoid duplication
    key: string | null,
    user_token: string | null
) => {
    const isAwaitingEmail = await memoryManager.get(phoneNo, SESSION_KEYS.AWAITING_EMAIL);
    const Sentiment = await memoryManager.get(phoneNo, SESSION_KEYS.SENTIMENT);
    const isWaitingName = await memoryManager.get(phoneNo, SESSION_KEYS.AWAITING_NAME);
    let currentContext = {};
//     console.log("# textMessage here #", textMessage);

    if (isWaitingName === true) {
        const fullNameParts = isFullName(textMessage.question);
        if (fullNameParts) {
            await memoryManager.set(phoneNo, SESSION_KEYS.FIRSTNAME, fullNameParts.firstName);
            await memoryManager.set(phoneNo, SESSION_KEYS.LASTNAME, fullNameParts.lastName);
            const email = await memoryManager.get(phoneNo, SESSION_KEYS.EMAIL);
            let ip_address = await memoryManager.get(phoneNo, SESSION_KEYS.IP_ADDRESS);

            currentContext = {
                firstname: fullNameParts.firstName,
                lastname: fullNameParts.lastName,
                email: email,
                phoneno: phoneNo,
                ip: ip_address
            };
            const askResponse = await getAskResponse(bodyParam, Sentiment, currentContext);
            console.log("# askResponse here #", askResponse);
            await sendTextMessages(phoneNo, `Thank you, ${fullNameParts.firstName} ${fullNameParts.lastName}.`);
            return;
        } else {
            await sendTextMessages(phoneNo, "Please provide a valid full name.");
        }
    }

    if (isAwaitingEmail === true) {
        if (isValidEmail(textMessage.question)) {
            const Sentiment = 'register';
            await memoryManager.set(phoneNo, SESSION_KEYS.EMAIL, textMessage.question);
            const contextResponse = await callContextService(bodyParam, Sentiment, context);

            if (contextResponse.data && contextResponse.data.length > 0) {
                await memoryManager.set(phoneNo, SESSION_KEYS.FIRSTNAME, contextResponse.data[0].firstname);
                await memoryManager.set(phoneNo, SESSION_KEYS.LASTNAME, contextResponse.data[0].lastname);
                if (contextResponse.data[0].email) {
                    await memoryManager.set(phoneNo, SESSION_KEYS.EMAIL, contextResponse.data[0].email);
                }
                await memoryManager.set(phoneNo, SESSION_KEYS.KEY, contextResponse.data[0].keys);
                await memoryManager.set(phoneNo, SESSION_KEYS.TOKEN, contextResponse.data[0].tokens);
                await memoryManager.set(phoneNo, SESSION_KEYS.AWAITING_NAME, true);
            }
//             console.log("# contextResponse here #", contextResponse);
            await sendTextMessages(phoneNo, contextResponse.answer);  // Changed from 'contextResponse.text' to 'contextResponse.answer'
        } else {
            await sendTextMessages(phoneNo, "Please provide a valid email address.");
        }
    } else {
        currentContext = {};
        const sentimentResponse = await getSentimentResponse(bodyParam, textMessage.question, currentContext);
        await memoryManager.set(phoneNo, SESSION_KEYS.SENTIMENT, sentimentResponse.sentiment);

        if (sentimentResponse.data && sentimentResponse.data.length > 0) {
            await memoryManager.set(phoneNo, SESSION_KEYS.FIRSTNAME, sentimentResponse.data[0].firstname);
            await memoryManager.set(phoneNo, SESSION_KEYS.LASTNAME, sentimentResponse.data[0].lastname);
            await memoryManager.set(phoneNo, SESSION_KEYS.EMAIL, sentimentResponse.data[0].email);
            await memoryManager.set(phoneNo, SESSION_KEYS.KEY, sentimentResponse.data[0].keys);
            await memoryManager.set(phoneNo, SESSION_KEYS.TOKEN, sentimentResponse.data[0].tokens);
            await sendTextMessages(phoneNo, sentimentResponse.answer);
            await memoryManager.set(phoneNo, SESSION_KEYS.AWAITING_EMAIL, true);
        }
    }
};
