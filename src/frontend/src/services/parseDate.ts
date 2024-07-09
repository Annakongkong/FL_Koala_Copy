export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr).toLocaleString();
    // console.log("datastr", dateStr);
    // console.log("date", date);
    return date;

    // const formatDate = (date: Date) => {
    //     const day = date.getDate();
    //     const month = date.getMonth() + 1; // Months are zero-based
    //     const year = date.getFullYear();
    //     const hours = date.getHours();
    //     const minutes = date.getMinutes();
    //     const seconds = date.getSeconds();
      
    //     // Format the date and time as desired
    //     return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    // }

    // return 
}