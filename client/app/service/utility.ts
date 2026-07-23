export const converstUTC = (utcdate: string | number | Date): string => {
    const date = new Date(utcdate);
    // Convert to GMT+7
    const options: Intl.DateTimeFormatOptions = { hour12: true };
    const dateInGMTPlus7 = date.toLocaleString('en-US', options);
    return dateInGMTPlus7;
};
