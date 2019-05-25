import {select, settings, templates} from '../settings.js';
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
  }

  initWidgets(){
    const thisBooking = this;
    //console.log('thisBooking.dom.peopleAmount: ', thisBooking.dom.peopleAmount);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
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
    }

}
