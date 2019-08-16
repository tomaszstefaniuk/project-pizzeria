
export class StartPage{

  constructor(){
    let disOrderButWrapper = document.getElementById('orderButton');
    let disBookButWrapper = document.getElementById('bookButton');

    function disableButtons() {
      document.getElementById("main_page_wrapp").style.display="none";
    }

    disOrderButWrapper.onclick = disableButtons;
    disBookButWrapper.onclick = disableButtons;
  }


}
