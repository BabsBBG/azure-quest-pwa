export interface VideoResource {
  id: string;
  title: string;
  source: string;
  url: string;
  duration: string;
  exam: "SC-300" | "AZ-500" | "SC-500";
  domain: string;
  description: string;
}

export const videos: VideoResource[] = [
  { id: "sc300-part-1", title: "SC-300: Implement and Manage User Identities", source: "Microsoft Learn Exam Readiness Zone", url: "https://learn.microsoft.com/shows/exam-readiness-zone/preparing-for-sc-300-implement-and-manage-user-identities", duration: "Exam prep segment", exam: "SC-300", domain: "Implement identities", description: "Official Microsoft exam prep for user identity implementation and management." },
  { id: "sc300-playlist", title: "SC-300 Microsoft Identity and Access Administrator", source: "Microsoft Learn YouTube", url: "https://www.youtube.com/playlist?list=PLahhVEj9XNTf6lWUbZLBNULQ7uVqM5Sad", duration: "Playlist", exam: "SC-300", domain: "All domains", description: "Official Microsoft Learn YouTube playlist for SC-300 study." },
  { id: "az500-part-1", title: "AZ-500: Secure Identity and Access", source: "Microsoft Learn Exam Readiness Zone", url: "https://learn.microsoft.com/shows/exam-readiness-zone/preparing-for-az-500-01-fy25", duration: "Part 1 of 4", exam: "AZ-500", domain: "Secure identity and access", description: "Official Microsoft exam prep video for identity and access security." },
  { id: "az500-part-2", title: "AZ-500: Secure Networking", source: "Microsoft Learn Exam Readiness Zone", url: "https://learn.microsoft.com/shows/exam-readiness-zone/preparing-for-az-500-02-fy25", duration: "Part 2 of 4", exam: "AZ-500", domain: "Secure networking", description: "Official Microsoft exam prep video for Azure network security." },
  { id: "az500-part-3", title: "AZ-500: Secure Compute, Storage, and Databases", source: "Microsoft Learn Exam Readiness Zone", url: "https://learn.microsoft.com/shows/exam-readiness-zone/preparing-for-az-500-03-fy25", duration: "Part 3 of 4", exam: "AZ-500", domain: "Compute, storage, databases", description: "Official Microsoft exam prep video for core Azure workload security." },
  { id: "az500-part-4", title: "AZ-500: Defender for Cloud and Sentinel", source: "Microsoft Learn Exam Readiness Zone", url: "https://learn.microsoft.com/shows/exam-readiness-zone/preparing-for-az-500-04-fy25", duration: "Part 4 of 4", exam: "AZ-500", domain: "Defender and Sentinel", description: "Official Microsoft exam prep video for security posture and operations." },
  { id: "az500-youtube-playlist", title: "Preparing for the AZ-500 Exam", source: "Microsoft Learn YouTube", url: "https://www.youtube.com/playlist?list=PLahhVEj9XNTeHdnTCgbrLL9cP0b10Km_D", duration: "Playlist", exam: "AZ-500", domain: "All domains", description: "Official Microsoft Learn YouTube playlist for AZ-500 exam prep." },
  { id: "sc500-study-guide-video-hub", title: "SC-500 Official Study Resources", source: "Microsoft Learn", url: "https://learn.microsoft.com/credentials/certifications/resources/study-guides/sc-500", duration: "Resource hub", exam: "SC-500", domain: "All domains", description: "SC-500 is tracked through the official Microsoft Learn study guide and course resources as the video library grows." }
];
