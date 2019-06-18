let Calendar = {
    'tpl': '#calendar-tpl',
    'appointments':{},
    'today': new Date(),
};
const Appointment = {
    'who': '',
    'about': '',
    'agenda': '',
    'day': '',
    'id':''
};
const Day = {
    'tpl': '#day-tpl',
    'int': 0
}
const Form = {
    'tpl': '#appointment-form-tpl',
    'id':'#appointment-form'
}


/**
 * Builds a new calendar for a given year and month from the calendar and day templates
 * 
 */
function buildCalendar(year, month){
  if (!year){
    year = Calendar.today.getFullYear();
    month = Calendar.today.getMonth();
  }
  let calendarTpl = document.querySelector(Calendar.tpl);
  let dayTpl = document.querySelector(Day.tpl);
  let app = document.querySelector('#application');
  app.innerHTML = calendarTpl.innerHTML;
  let wDays = document.querySelectorAll('#calendar .week');
  let firstDay = new Date(year, month, 1);
  let today = new Date();
  let numberOfWeeks = checkSixWeeks(year, month) ? 6 : 5;
  let start = firstDay.getDay() == 0 ? 1 : firstDay.getDay()*-1+1;
  console.log(start);
  document.querySelector('#calendar header h1').innerHTML = firstDay.toLocaleString(
    'en-us', 
    {'month': 'long', 'year':'numeric'}
  );
  for (let i = start; (i-start)/7<numberOfWeeks; i++){      
    let day = new Date(year, month, i);
    wDays[day.getDay()].children[1].innerHTML += dayTpl.innerHTML;
    let newday = document.querySelector('#day-unknown');
    newday.id = day2Id(day);
    newday.children[0].children[0].innerHTML = day.getDate();
    let button = newday.querySelector('button');
    let yesterday = new Date();
    yesterday.setDate(today.getDate() -1);
    if (day < yesterday){
      button.setAttribute('title', 'This date is in the past. You can no longer add appointments to it.');
      button.innerHTML = '&minus;';
      newday.classList.add('past');
    }else{
      button.setAttribute('onclick', 'dayForm(this)');
      button.innerHTML = '&plus;'
    }
    if (day.getMonth() !== month){
      newday.classList.add('other-month');
    }
    if(
      day.getDate() == today.getDate() &&
      day.getMonth() == today.getMonth() &&
      day.getYear() == today.getYear() 
    ){
      newday.classList.add('today');
    }
  }
}

function checkSixWeeks(year, month){
  let lastDayOfMonth = new Date(year, month+1, 0);
  return lastDayOfMonth.getDate()-lastDayOfMonth.getDay()>=30;
}

/**
 * Changes the Calendar +/- months
 *
 */
function changeMonth(months){
  Calendar.today = addMonth(Calendar.today, months);
  buildCalendar();
  displayAppointments();
}

function addMonth(d, months){
  return new Date(d.getFullYear(), d.getMonth()+months, d.getDate());
}


/**
 * Day id builder
 */
function day2Id(day){
    return `day-${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`;
}

/**
 * Day from id
 */
function id2Day(id){
    let dateList = id.replace("#","").split("-");
    return new Date(dateList[1], dateList[2]-1, dateList[3]);
}
/**
 * Day from appointment id
 */
function idAppointment2Day(id){
    let dateList = id.split("-");
    return new Date(dateList[4], dateList[5]-1, dateList[6]);
}

function showMessage(title, message){
    let dialog = document.querySelector('dialog');
    dialog.querySelector('header').innerHTML = title;
    dialog.querySelector('main').innerHTML = message;
    try{
        dialog.querySelector('button').setAttribute('type', 'submit');
        dialog.showModal();
        setTimeout( ()=>{dialog.close() }, 3000);
    }catch(err){ // Firefox fix
        dialog.setAttribute('open', true);
        dialog.classList.add('show-details');
        dialog.querySelector('button').setAttribute('type', 'button');
        dialog.querySelector('button').addEventListener('click', ()=>{closeMessage()});
        setTimeout( ()=>{closeMessage() }, 3000);
        return "ok";
    }
}

/**
 * Close Modal dialog.
 */
function closeMessage(){
  console.log('removing');
    document.querySelector('dialog').removeAttribute('open');
}

/**
 * Rebuilds the appointment form for a specific day
 */
function dayForm(el){
  buildForm(el.parentElement.parentElement.id);
  window.location.href ="/#appointment-form";
}

/**
 * Process the submission of an appointment form
 */
function submitForm(){
    let form = document.querySelector(Form.id);
    let appointment = Object.create(Appointment);
    appointment.who = form.querySelector("[name=who]").value;
    appointment.about = form.querySelector("[name=about]").value;
    appointment.agenda = form.querySelector("[name=agenda]").value;
    let day = form.querySelector("[name=day]").value;
    appointment.day = day;
    // Create a random id if it is a new appointment
    appointment.id = form.querySelector("[name=id]").value || 
        'appointment-'+
        form.querySelector("[name=day]").value+'-'+
        (1+Math.random()).toString(36).substring(7)
    ;
    Calendar.appointments[day] = appointment;
    closeForm();
    showNewAppointment(appointment);
    showMessage("Success", "Your appointment has been sucessfully saved.");
}

function askConfirmation(title, message){
    let modal = document.querySelector('modal');
    
}

function removeConfirmation(el){
    let ok = askConfirmation(
      "Are you sure?",
      "You are about to remove this appointment. This action cannot be undone. Do you want to proceed?"
    );
}

/**
 * Remove the appointment being edited
 */
function removeThisAppointment(){
    removeAppointment(document.querySelector('[name=day]').value);
    closeForm();
    showMessage("Appointment removed", "Your appointment has been sucessfully removed.");
}

/** 
 * Remove a given appointment
 */
function removeAppointment(day){
    delete Calendar.appointments[day];
    document.querySelector(`#${day}`).classList.remove('filled');
    document.querySelector(`#${day} main`).innerHTML = '';
}

/**
 * Writes the new appointment to it's day inside the calendar
 */
function showNewAppointment(appointment){
  let tpl = document.querySelector('#appointment-tpl').innerHTML;
  let a = document.querySelector('#scheduled-appointment-'+appointment.id) || (()=>{
    let a = document.querySelector(`#${appointment.day} main`);
    if (a){
      a.innerHTML = tpl;
      return document.querySelector('#appointment-unknown');
    }
  })();
  if (a){
    document.querySelector(`#${appointment.day}`).classList.add('filled');
    a.querySelector('h1').innerText = appointment.about;
    a.querySelector('.with').innerText = appointment.who;
    a.querySelector('main').innerText = appointment.agenda;
    a.id = 'scheduled-appointment-'+appointment.id;
  }
}

/**
 * Inserts all appointments from Calendar.appointments in the #calendar
 */
function displayAppointments(){
    Object.values(Calendar.appointments).forEach((a)=>{showNewAppointment(a)});
}

/**
 * Closes the appointment editing form
 */
function closeForm(){
    let form = document.querySelector(Form.id);
    form.style.maxHeight = 0;
    form.style.padding = 0;
}

/**
 * Receives a day id and builds a new form for the day appointment 
 */
function buildForm(dayId){
    // Validate input
    if (dayId === undefined){
        showMessage("An error occurred.", "Please, select a day in order to edit an appointment.");
        return;
    }
    let app = document.querySelector('#application');
    // Create form from template if it doesn't exist
    let form = document.querySelector(Form.id);
    if (form == null){
        app.innerHTML = document.querySelector(Form.tpl).innerHTML+app.innerHTML;
        form = document.querySelector(Form.id);
    }
    // Fill the day -- it should always be filled
    form.querySelector("[name='day']").value = dayId;
    let day = id2Day(dayId);
    let daynum = day.getDate();
    let monthName = day.toLocaleString( 'en-us', {'month': 'long'});
    let daysuf = daynum == 1 ? 'st' : daynum == 2 ? 'nd' : daynum == 3 ? 'rd' : 'th';
    // Fill in the form values for the current appointment
    let appointment = Calendar.appointments[dayId] || Appointment;
    if (appointment.id){
        form.querySelector("header").innerHTML = `<strong class="editing">Editing appointment for ${monthName} ${daynum}${daysuf}</strong>`;
    }else{
        form.querySelector("header").innerHTML = `Appointment for ${monthName} ${daynum}${daysuf}`;
    }
    Object.keys(appointment).forEach(
       function(key){
           if (key!='day' ){
              form.querySelector(`[name='${key}']`).value = appointment[key] || '';
           }
       }
    );
    setTimeout(()=>{ form.style.maxHeight = '500px';  }, 0);
}

/**
 * Close the Details overlay
 */
function removeDetails(){
    document.querySelectorAll('.show-details').forEach(
      function(el){ el.classList.remove('show-details');}
    );
}

/**
 * Display an overlay with details of an appointment
 */
function showDetails(el){
    el.parentElement.parentElement.classList.add('show-details');
    let dialog = document.querySelector('dialog');
    if (dialog){
        try{
            dialog.close();
        }catch (err){
            dialog.removeAttribute('open');
        }
    }
}

/**
 * Buld an appointment for for an existing appointment
 */
function editAppointment(el){
    removeDetails();
    let dayId = el.parentElement.parentElement.id;
    buildForm(day2Id(idAppointment2Day(el.parentElement.parentElement.id)));
}

/**
 * Download a JSON file with the Calendar object so that the user can save it.
 */
function saveCalendar(){
    let CalendarFile = new Blob([JSON.stringify(Calendar)], {type: 'text/json'});
    let downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(CalendarFile);
    downloadLink.download = "calendar.json";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/**
 * Restore a previously saved Calendar object
 */
function restoreCalendar(){
    let calFile = document.querySelector("#calendar-file").files[0];
    let reader = new FileReader();
    reader.onload = (ev)=>{
        let newCalendar = JSON.parse(ev.target.result);
        if (newCalendar.tpl == "#calendar-tpl"){
            Calendar = newCalendar;
            Calendar.today = new Date(Calendar.today);
            buildCalendar();
            displayAppointments();
            showMessage("Success", "Your calendar has been restored.");
        }
    }
    reader.readAsText(calFile);
}

function enableRestore(){
    document.getElementById('restore').removeAttribute('disabled');
}


buildCalendar();
