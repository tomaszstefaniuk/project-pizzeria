import {select, settings, classNames, templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {utils} from '../utils.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking{
  constructor(bookingElem){
    const thisBooking = this;

    thisBooking.render(bookingElem);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tablePicker();

    console.log('thisBooking: ', thisBooking);
  }

  render(bookingElem){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingElem;
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    //console.log('utils.createDOMFromHTML(generatedHTML): ', utils.createDOMFromHTML(generatedHTML));
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    //console.log('thisBooking.dom.peopleAmount: ', thisBooking.dom.peopleAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    //console.log('thisBooking.dom.tables: ', thisBooking.dom.tables);

    /* DONE */
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    //console.log('thisBooking.dom.starters: ', thisBooking.dom.starters);

  }

  initWidgets(){
    const thisBooking = this;
    //console.log('thisBooking.dom.peopleAmount: ', thisBooking.dom.peopleAmount);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    /*IN PROGRESS */
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendOrder();
    });
    //console.log('thisBooking.dom.wrapper: ', thisBooking.dom.form);

  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

    }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let eventCurrent of eventsCurrent){
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
      //console.log('eventCurrent: ', eventCurrent);
    }

    for(let booking of bookings){
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    for(let eventRepeat of eventsRepeat){

      const minDate = utils.dateToStr(thisBooking.datePicker.minDate);
      const days = [];
      //console.log('minDate: ', minDate);

      for (let i = 0; i < settings.datePicker.maxDaysInFuture; i++){

        let nextDay = utils.addDays(minDate, i);
        let nextDate = utils.dateToStr(nextDay);

        days.push(nextDate);

        for(let day of days){
          eventRepeat.date = day;
        }

        thisBooking.makeBooked(eventRepeat.date, eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }

    }

    console.log('thisBooking.booked: ', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    hour = utils.hourToNumber(hour);
    //console.log('date: ', date, 'hour: ', hour, 'duration: ', duration, "table: ", table);

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    if(typeof thisBooking.booked[date][hour] == 'undefined'){
      thisBooking.booked[date][hour] = [];
    }

    thisBooking.booked[date][hour].push(table);
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){

      let tableNum = table.getAttribute('data-table');

      if(thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableNum)){
        table.classList.add(classNames.booking.tableBooked);
        //console.log('table: ', table)
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }
  }

  /* DONE */
  tablePicker(){
    const thisBooking = this;
    thisBooking.table = [];

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function(event){
        event.preventDefault();
        table.classList.toggle(classNames.booking.tableSelected);
      })

      thisBooking.dom.datePicker.addEventListener('updated', function(){
        table.classList.remove(classNames.booking.tableSelected);
      });

      thisBooking.dom.hourPicker.addEventListener('updated', function(){
        table.classList.remove(classNames.booking.tableSelected);
      });

    }
  }

  startersPicker(){
    const thisBooking = this;

    thisBooking.starters = [ ];

    for(let starter of thisBooking.dom.starters){

      let starterInput = starter.getElementsByTagName('input')[0];

      if(starterInput.checked){
        thisBooking.starters.push(starterInput.value);
      }
      //console.log('starter: ', starterInput);
    }

  }

  /* DONE */
  sendOrder(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    console.log('thisBookingSending: ', thisBooking);
    //console.log('thisBooking hoursAmount: ', thisBooking.hoursAmount.correctValue);
    //console.log('thisBooking.table: ', thisBooking.table);

    thisBooking.startersPicker();

    /* TABLE PICKER */
    for (let table of thisBooking.dom.tables) {
        if(table.classList.contains(classNames.booking.tableSelected)){
          thisBooking.table.push( parseInt(table.getAttribute('data-table')) );
          //console.log('thisBooking.table: ', thisBooking.table);
        }
    }


    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.table,
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.starters
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }

}
