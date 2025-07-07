// Business hours utility for Netherlands timezone
export function isBusinessOpen(): boolean {
  const now = new Date();
  const netherlandsTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  
  const hour = netherlandsTime.getHours();
  const day = netherlandsTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Open Monday-Saturday (1-6), 10 AM to 7 PM
  const isWeekday = day >= 1 && day <= 6;
  const isBusinessHours = hour >= 10 && hour < 19; // 10 AM to 7 PM
  
  return isWeekday && isBusinessHours;
}

export function getBusinessStatus(): {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
} {
  const now = new Date();
  const netherlandsTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" }));
  
  const hour = netherlandsTime.getHours();
  const day = netherlandsTime.getDay(); // 0 = Sunday, 6 = Saturday
  const isOpen = isBusinessOpen();
  
  if (isOpen) {
    const closingTime = new Date(netherlandsTime);
    closingTime.setHours(19, 0, 0, 0); // 7 PM
    const hoursUntilClose = Math.floor((closingTime.getTime() - netherlandsTime.getTime()) / (1000 * 60 * 60));
    
    return {
      isOpen: true,
      message: `Open until 7 PM (${hoursUntilClose}h remaining)`,
    };
  }
  
  // Calculate next opening time
  let nextOpen = new Date(netherlandsTime);
  
  if (day === 0) { // Sunday
    nextOpen.setDate(nextOpen.getDate() + 1); // Monday
    nextOpen.setHours(10, 0, 0, 0);
  } else if (day === 6) { // Saturday
    nextOpen.setDate(nextOpen.getDate() + 2); // Monday
    nextOpen.setHours(10, 0, 0, 0);
  } else if (hour >= 19) { // After closing on weekday
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(10, 0, 0, 0);
  } else { // Before opening on weekday
    nextOpen.setHours(10, 0, 0, 0);
  }
  
  const nextOpenStr = nextOpen.toLocaleDateString("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit"
  });
  
  return {
    isOpen: false,
    message: `Closed - Opens ${nextOpenStr}`,
    nextOpenTime: nextOpenStr,
  };
}

export function getCurrentNetherlandsTime(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}