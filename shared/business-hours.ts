// Business hours utility for Netherlands timezone
export function isBusinessOpen(): boolean {
  const now = new Date();
  
  // Create a new date in Netherlands timezone
  const netherlandsDate = new Date(now.toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" }));
  
  const hour = netherlandsDate.getHours();
  const day = netherlandsDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Open 7 days a week, 10 AM to 7 PM
  const isBusinessHours = hour >= 10 && hour < 19; // 10 AM to 7 PM
  
  return isBusinessHours;
}

export function getBusinessStatus(): {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
} {
  const isOpen = isBusinessOpen();
  
  if (isOpen) {
    return {
      isOpen: true,
      message: `Open until 7 PM`,
    };
  }
  
  // For closed status, determine next opening time
  const now = new Date();
  const netherlandsDate = new Date(now.toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" }));
  
  const hour = netherlandsDate.getHours();
  
  let nextOpenStr: string;
  
  if (hour >= 19) { // After closing
    nextOpenStr = "Tomorrow 10:00 AM";
  } else { // Before opening
    nextOpenStr = "10:00 AM";
  }
  
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