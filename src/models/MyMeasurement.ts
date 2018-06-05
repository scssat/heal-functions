export interface MyMeasurement {
  id?: string;
  name?: string;
  allowDelete?: boolean;
  cancerTypes?: string;
  gender?: string;
  measurementURL?: string;
  units?: string;
  graphURL?: string;
  description?: string;
  general?: boolean;
  selected?: boolean;
  firstMeasurement?: any;
  custom?: boolean;
  copyToCalendar?: boolean;
  color?: string;
  times?: string[];
  notification?: number;
  numberOfMeasures?: number;
  lastCalendarUpdate?: any;
}
