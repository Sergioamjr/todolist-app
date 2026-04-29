import dayjs from "dayjs";

class DateHelper {
  static formatDate(
    date: Date | string,
    format: string = "YYYY-MM-DD",
  ): string {
    return dayjs(date).format(format);
  }
}

export default DateHelper;
