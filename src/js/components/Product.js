import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* [DONE] find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* [DONE] START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(){
      /* [DONE] prevent default action for event */
      event.preventDefault();
      /* [DONE] toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* [DONE] find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* [DONE] START LOOP: for each active product */
      for(let activeProduct of activeProducts){
        /* [IN PROGRESS] START: if the active product isn't the element of thisProduct */
        if(activeProduct !== thisProduct.element){
          /* [DONE] remove class active for the active product */
          activeProduct.classList.remove('active');
        /* [DONE] END: if the active product isn't the element of thisProduct */
        }
      /* [DONE] END LOOP: for each active product */
      }
    /* [DONE] END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;

    /* [DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData: ', formData);
    thisProduct.params = {};
    /* [DONE] set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;
    /* Images code */
    const imageElements = thisProduct.imageWrapper;
    /* [DONE] START LOOP: for each paramId in thisProduct.data.params */
    for(let paramId in thisProduct.data.params){
      //console.log('paramId: ', paramId);
      /* [DONE] save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];

      /* [DONE] START LOOP: for each optionId in param.options */
      for(let optionId in param.options){
        /* [DONE] save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        //console.log('option: ', option);

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        /* [DONE] START IF: if option is selected and option is not default */
        if(optionSelected && !option.default){
          /* [DONE] add price of option to variable price */
          price += option.price;
          //console.log('optionId: ', paramId);

        /* [DONE] END IF: if option is selected and option is not default */
        /* [DONE] START ELSE IF: if option is not selected and option is default */
        } else if (!optionSelected && option.default) {
          /* [DONE] deduct price of option from price */
          price -= option.price;
          /* [DONE] END ELSE IF: if option is not selected and option is default */
        }
        /* Images code*/
        let foundElem = imageElements.querySelectorAll('.' + paramId + '-' + optionId);

        if(optionSelected){

          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for(let elem of foundElem){
            elem.classList.add(classNames.menuProduct.imageVisible);
          }

        }else{
          for(let elem of foundElem){
            elem.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

      /* [DONE] END LOOP: for each optionId in param.options */
      }
    /* [DONE] END LOOP: for each paramId in thisProduct.data.params */
    }
    /* [NEW] multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* [DONE] set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log("thisProduct.params: ", thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
