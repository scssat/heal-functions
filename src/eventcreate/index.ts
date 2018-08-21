import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as moment from 'moment';
import * as shared from '../collections';
import { CalendarEvent } from '../models/event.model';
admin.initializeApp();
const db = admin.firestore();

export const createEvents = functions.https.onRequest(async (req, res) => {
  const docRef = db.collection(shared.USERS);
  // const settings = { timestampsInSnapshots: true };
  //admin.firestore().settings(settings);

  await docRef
    .where('active', '==', true)
    .orderBy('email', 'asc')
    .get()
    .then(querySnapshot => {
      const users = [];
      querySnapshot.forEach(doc => {
        users.push(doc.data());
      });

      //res.send(users);
      users.forEach(user => {
        analyzeAll(user.email, res).catch(err => {
          console.log(`Error when analyzing users! - ${err}`);
          res.end();
        });
      });
      console.log(`Number users analyzed:${users.length}`);
      res.send('OK');
      return null;
    })
    .catch(err => {
      console.log(`Error when reading users! - ${err}`);
      res.end();
    });
});

async function analyzeAll(email, res) {
  await analyzeMedication(email, res).catch(err =>
    console.log(`Error when analyzing medication for user: ${email}! - ${err}`)
  );
  await analyzeMesurement(email, res).catch(err =>
    console.log(
      `Error when analyzing measurements for user: ${email}! - ${err}`
    )
  );
  res.send('OK');
  return null;
}

async function analyzeMedication(email, res) {
  const medications = [];
  const docRefMedication = db.collection(
    `${shared.USERS}/${email}/${shared.MY_MEDICATION_CABINET}`
  );

  // Create medication events in calendar
  await docRefMedication
    .where('active', '==', true)
    .orderBy('medicationName', 'asc')
    .get()
    .then(querySnapshot1 => {
      querySnapshot1.forEach(doc => {
        const data = doc.data();
        if (data.frequencyValue > 0) {
          const md = { id: doc.id, data: doc.data() };
          medications.push(md);
        }
      });

      medications.forEach(medication => {
        createMedicationEvents(medication.id, medication.data, email);
      });
      console.log(
        `Number of medications (user:${email}) analyzed for events:${
          medications.length
        }`
      );
    })
    .catch(err => {
      console.log(`Error when reading medications! - ${err}`);
    });
}

async function analyzeMesurement(email, res) {
  const docRefMeasurement = db.collection(
    `${shared.USERS}/${email}/${shared.MY_MEASUREMENT}`
  );
  const measurements = [];

  // Create measurement events in calendar
  await docRefMeasurement
    .where('copyToCalendar', '==', true)
    .orderBy('name', 'asc')
    .get()
    .then(querySnapshot2 => {
      querySnapshot2.forEach(doc => {
        const tr = { id: doc.id, data: doc.data() };
        measurements.push(tr);
      });

      measurements.forEach(measurement => {
        createMeasurementWrapper(measurement.id, measurement.data, email);
      });
      console.log(
        `Number of measurments (user:${email}) analyzed for events:${
          measurements.length
        }`
      );
    })
    .catch(err => {
      console.log(`Error when reading measurements! - ${err}`);
    });
}

function createMedicationEvents(id, medicationCabinet, email) {
  moment.locale('nb');

  switch (medicationCabinet.frequencyValue) {
    // Every day
    case 1:
      createEventWrapper(id, medicationCabinet, email);
      break;
    // Every other day
    case 2:
      if (!medicationCabinet.lastCalendarUpdate) {
        createEventWrapper(id, medicationCabinet, email);
      } else if (
        moment(medicationCabinet.lastCalendarUpdate).format('l') !==
        moment(new Date())
          .subtract(1, 'days')
          .format('l')
      ) {
        createEventWrapper(id, medicationCabinet, email);
        // Subtract one from today and check if yesterday was medication day
      } else {
        // Nothing
      }
      break;

    // Specific day
    case 3:
      // Check if TODAY is a medication day.
      const weekDay = new Date();
      switch (weekDay.getDay()) {
        case 0:
          if (medicationCabinet.sunday) {
            createEventWrapper(id, medicationCabinet, email);
          }
          break;
        case 1:
          if (medicationCabinet.monday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;
        case 2:
          if (medicationCabinet.tuesday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;
        case 3:
          if (medicationCabinet.wednesday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;
        case 4:
          if (medicationCabinet.thursday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;
        case 5:
          if (medicationCabinet.friday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;
        case 6:
          if (medicationCabinet.saturday) {
            createEventWrapper(id, medicationCabinet, email);
          }

          break;

        default:
          // Nothing
          break;
      }
      break;

    default:
      break;
  }
}

function createEventWrapper(id, medicationCabinet, email) {
  let updateCalendar: boolean = false;
  // const timeNow = moment(new Date())
  //   .format('LT')
  //   .toString();

  for (let i = 0; i < medicationCabinet.timesPerDayValue; i++) {
    createEvent(id, medicationCabinet, medicationCabinet.intakeTime[i], email);
    medicationCabinet.lastCalendarUpdate = new Date();
    updateCalendar = true;
  }
  if (updateCalendar) {
    updateMedicationCabinet(id, medicationCabinet, email);
    createComplianceRecord(id, medicationCabinet, email);
  }
}

function createEvent(id, medicationCabinet, time, email) {
  const startTime =
    moment(new Date())
      .format('YYYY-MM-DDT')
      .toString() +
    time +
    ':00';

  const startTimeDate = new Date(startTime);
  let endTimeDate = new Date(startTime);
  const add30Min = moment(endTimeDate)
    .add(20, 'minutes')
    .toString();
  endTimeDate = new Date(add30Min);

  const calendarEvent: CalendarEvent = {
    id: '',
    title: 'Medisin:' + medicationCabinet.medicationName,
    location: 'Ikke relevant',
    description: '',
    eventDate: moment()
      .format('l')
      .toString(),
    start: new Date(
      moment(startTimeDate)
        .subtract(2, 'hours')
        .format()
        .toString()
    ),
    end: new Date(
      moment(endTimeDate)
        .subtract(2, 'hours')
        .format()
        .toString()
    ),
    weekNo: 0,
    parentId: '',
    allDay: false,
    editable: false,
    startEditable: false,
    duartionEditable: false,
    resourceEditable: false,
    overlap: true,
    className: '',
    color: medicationCabinet.color ? medicationCabinet.color : 'blue',
    backgroundColor: '',
    borderColor: '',
    textColor: 'White',
    url: '',
    completed: false,
    measuremendtId: '',
    treatmentId: '',
    notification:
      medicationCabinet.notification === 0 ? 2 : medicationCabinet.notification,
    medicationCabinetId: id,
    contactId: '',
    contactPerson: '',
    type: shared.ENVENT_TYPE_MEDICATION,
    comment:
      'Inntak av medisin. Dose:' +
      `${medicationCabinet.dose} ${medicationCabinet.unit} - Antall: ${
        medicationCabinet.unitsPerDose
      } (Merk: Denne kan være endret)
    `
  };

  newCalendarEvent(calendarEvent, email);
}

function createMeasurementWrapper(id, myMeasurement, email) {
  moment.locale('nb');
  let updateCalendar: boolean = false;

  for (const time of myMeasurement.times) {
    createMeasurementEvent(id, myMeasurement, time, email);
    myMeasurement.lastCalendarUpdate = new Date();
    updateCalendar = true;
  }
  if (updateCalendar) {
    updateMyMeasurement(id, myMeasurement, email);
  }
}

function createMeasurementEvent(id, myMeasurement, time, email) {
  const startTime =
    moment(new Date())
      .format('YYYY-MM-DDT')
      .toString() +
    time +
    ':00';

  const startTimeDate = new Date(startTime);
  let endTimeDate = new Date(startTime);
  const add30Min = moment(endTimeDate)
    .add(20, 'minutes')
    .toString();
  endTimeDate = new Date(add30Min);

  const calendarEvent: CalendarEvent = {
    id: '',
    title: 'Måling:' + myMeasurement.name,
    location: 'Ikke relevant',
    description: '',
    eventDate: moment()
      .format('l')
      .toString(),
    start: new Date(
      moment(startTimeDate)
        .subtract(2, 'hours')
        .format()
        .toString()
    ),
    end: new Date(
      moment(endTimeDate)
        .subtract(2, 'hours')
        .format()
        .toString()
    ),
    weekNo: 0,
    parentId: '',
    allDay: false,
    editable: true,
    startEditable: true,
    duartionEditable: true,
    resourceEditable: true,
    overlap: true,
    className: '',
    color: myMeasurement.color ? myMeasurement.color : 'blue',
    backgroundColor: '',
    borderColor: '',
    textColor: 'White',
    url: '',
    completed: false,
    measuremendtId: id,
    treatmentId: '',
    notification: myMeasurement.notification,
    medicationCabinetId: '',
    contactId: '',
    contactPerson: '',
    type: shared.ENVENT_TYPE_MEASUREMENT,
    comment: ''
  };

  newCalendarEvent(calendarEvent, email);
}

function updateMedicationCabinet(id, medicationCabinet, email) {
  const docRef = db
    .collection(`${shared.USERS}/${email}/${shared.MY_MEDICATION_CABINET}`)
    .doc(id);
  docRef.update(medicationCabinet).catch(err => {
    console.log(`Error when updating medication! - ${err}`);
  });
}

function createComplianceRecord(id, medicationCabinet, email) {
  moment.locale('nb');
  // Should have a check if the record has been

  const medicationCompliance = {
    id: '',
    medicationCabinetId: id,
    medicationHistoryId: '',
    medicationName: medicationCabinet.medicationName,
    frequence: medicationCabinet.frequencyValue,
    createdDate: new Date(),
    keyDate: moment(new Date())
      .format('l')
      .toString(),
    plannedIntakeToday: medicationCabinet.timesPerDayValue,
    actualIntakeToday: 0
  };

  db.collection(`${shared.USERS}/${email}/${shared.MY_MEDICATION_COMPLIANCE}`)
    .add(medicationCompliance)
    .catch(err => {
      console.log(`Error when adding medication compliance! - ${err}`);
    });
}

function newCalendarEvent(calendarEvent, email) {
  db.collection(`${shared.USERS}/${email}/${shared.MY_EVENTS}`)
    .add(calendarEvent)
    .catch(err => {
      console.log(`Error when adding calendar event! - ${err}`);
    });
}

function updateMyMeasurement(id, myMeasurement, email) {
  const docRef = db
    .collection(`${shared.USERS}/${email}/${shared.MY_MEASUREMENT}`)
    .doc(id);
  docRef.update(myMeasurement).catch(err => {
    console.log(`Error when updating measurement calendar event! - ${err}`);
  });
}
