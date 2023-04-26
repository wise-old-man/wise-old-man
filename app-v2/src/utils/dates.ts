import Timeago from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

Timeago.addDefaultLocale(en);
const timeago = new Timeago("en-US");

export { timeago };
