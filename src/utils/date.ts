import { SITE } from "../config/site";

const dateFormatter = new Intl.DateTimeFormat(SITE.lang, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: SITE.timezone,
});

const archiveYearFormatter = new Intl.DateTimeFormat(SITE.lang, {
  year: "numeric",
  timeZone: SITE.timezone,
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function getArchiveYear(date: Date): string {
  return archiveYearFormatter.format(date);
}
