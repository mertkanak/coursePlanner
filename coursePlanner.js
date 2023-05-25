const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const courses = [];
const classrooms = [];
const courseTimings = [];

const coursesPath = path.join(__dirname, 'Courses.csv');
const classroomsPath = path.join(__dirname, 'classroom.csv');
const courseTimingsPath = path.join(__dirname, 'busy.csv');

const readCourses = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(coursesPath)
      .pipe(csv())
      .on('data', (data) => {
        courses.push(data);
      })
      .on('end', () => {
        console.log('Courses:', courses);
        resolve();
      })
      .on('error', reject);
  });
};

const readClassrooms = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(classroomsPath)
      .pipe(csv())
      .on('data', (data) => {
        classrooms.push(data);
      })
      .on('end', () => {
        console.log('Classrooms:', classrooms);
        resolve();
      })
      .on('error', reject);
  });
};

const readCourseTimings = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(courseTimingsPath)
      .pipe(csv())
      .on('data', (data) => {
        courseTimings.push(data);
      })
      .on('end', () => {
        console.log('Course Timings:', courseTimings);
        resolve();
      })
      .on('error', reject);
  });
};

Promise.all([readCourses(), readClassrooms(), readCourseTimings()])
  .then(() => {
    const assignedCourses = assignCourses();
    console.log('Assigned Courses:', assignedCourses);
  })
  .catch((err) => {
    console.error(err);
  });

const assignedCourses = assignCourses();
console.log('Assigned Courses:', assignedCourses);




  function assignCourses() {
    const assignedCourses = [];
  
    // Iterate over each year
    for (let year = 1; year <= 4; year++) {
      // Filter courses for current year
      const yearCourses = courses.filter((course) => course.Year == year);
  
      // Create array for time slots for each day
      const timeSlots = Array(5)
        .fill()
        .map(() => Array(2).fill(null));
  
      // Iterate over each course for the year
      for (let i = 0; i < yearCourses.length; i++) {
        const course = yearCourses[i];
  
        // Find available time slot and classroom for the course
        let assignedTimeSlot = null;
        let assignedClassroom = null;
        for (let j = 0; j < classrooms.length; j++) {
          const classroom = classrooms[j];
          if (classroom.Capacity >= course.Registered_Students) {
            for (let day = 0; day < 5; day++) {
              for (let time = 0; time < 2; time++) {
                if (timeSlots[day][time] === null) {
                  assignedTimeSlot = { day, time };
                  assignedClassroom = classroom.Classroom;
                  break;
                }
              }
              if (assignedTimeSlot !== null) {
                break;
              }
            }
            if (assignedTimeSlot !== null) {
              break;
            }
          }
        }
  
        // If no available time slot and classroom found, throw an error
        if (assignedTimeSlot === null || assignedClassroom === null) {
          throw new Error(`Cannot assign time slot and classroom for ${course.Course_Code}`);
        }
  
        // Add assigned course to assignedCourses array and mark time slot as used
        assignedCourses.push({
          course: course.Course_Code,
          year: course.Year,
          day: assignedTimeSlot.day,
          time: assignedTimeSlot.time,
          classroom: assignedClassroom,
        });
        timeSlots[assignedTimeSlot.day][assignedTimeSlot.time] = course.Course_Code;
      }
    }
  
    return assignedCourses;
  }
  