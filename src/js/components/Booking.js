import {select, templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {utils} from '../utils.js';

export class Booking{ /* 9.3 */
  constructor(bookingElem){
    const thisBooking = this;

    thisBooking.render(bookingElem);
    thisBooking.initWidgets();
  }

  render(bookingElem){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};

    /* IN PROGRESS */
    thisBooking.dom.wrapper = bookingElem;
    thisBooking.dom.wrapper.innerHTML = utils.createDOMFromHTML(generatedHTML);
    //console.log('utils.createDOMFromHTML(generatedHTML): ', utils.createDOMFromHTML(generatedHTML));
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log('thisBooking.dom.peopleAmount: ', thisBooking.dom.peopleAmount);
  }

  initWidgets(){
    const thisBooking = this;
    //console.log('thisBooking.dom.peopleAmount: ', thisBooking.dom.peopleAmount);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
