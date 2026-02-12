export const trackCourseEvent = (event: string, data: Record<string, any>) => {
  console.log(`[analytics] ${event}`, data);
};
