export const converstUTC=(utcdate)=>{
    const date = new Date(utcdate);
    // Convert to GMT+7
    const options = {  hour12: true };
    const dateInGMTPlus7 = date.toLocaleString('en-US', options);
    return dateInGMTPlus7;
}