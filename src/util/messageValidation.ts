

export function messagesCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.messages && 
        body_param.entry[0].changes[0].value.messages[0]  
        ){
            return true;
        }else{
            return false;
        }
}

export function textMesssgeCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.messages && 
        body_param.entry[0].changes[0].value.messages[0] &&
        body_param.entry[0].changes[0].value.messages[0].text &&
        body_param.entry[0].changes[0].value.messages[0].text.body)
        {
            return true;
        }else{
            return false;
        }
}

export function statusCheck(body_param:any):boolean{
    if(body_param.entry && 
        body_param.entry[0].changes && 
        body_param.entry[0].changes[0].value.statuses && 
        body_param.entry[0].changes[0].value.statuses[0]){

            return true;

        }else{
            return false;
        }
}
