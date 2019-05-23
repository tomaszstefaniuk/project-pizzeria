import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';

export class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    const flatOpts = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function(date) {
            // return true to disable
            return (date.getDay() === 1);
        }
      ],
      locale: {
          "firstDayOfWeek": 1 // start week on Monday
      },
      onChange: function(selectedDates, dateStr, instance) {
        thisWidget.value = dateStr;
      }
    };

    thisWidget.minDate = utils.dateToStr(new Date(thisWidget.value));
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    //console.log('thisWidget.minDate: ', thisWidget.minDate);

    flatpickr(thisWidget.dom.input, flatOpts);
    //console.log('thisWidget.minDate: ', thisWidget.minDate);
  }



  parseValue(newValue){
    return newValue;
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
  }



}
