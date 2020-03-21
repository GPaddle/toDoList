"use strict"

/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

  //////////////////////////
  // Tabbar Page Controller //
  //////////////////////////
  tabbarPage: function (page) {
    // Set button functionality to open/close the menu.
    page.querySelector(`[component="button/menu"]`).onclick = function () {
      document.querySelector(`#mySplitter`).left.toggle();
    };

    // Set button functionality to push `new_task.html` page.
    Array.prototype.forEach.call(page.querySelectorAll(`[component="button/new-task"]`), function (element) {
      element.onclick = function () {
        document.querySelector(`#myNavigator`).pushPage(`html/new_task.html`);
      };

      element.show && element.show(); // Fix ons-fab in Safari.
    });

    // Change tabbar animation depending on platform.
    page.querySelector(`#myTabbar`).setAttribute(`animation`, ons.platform.isAndroid() ? `slide` : `none`);
  },

  ////////////////////////
  // Menu Page Controller //
  ////////////////////////
  menuPage: function (page) {
    // Set functionality for `No Category` and `All` default categories respectively.
    myApp.services.categories.bindOnCheckboxChange(page.querySelector(`#default-category-list ons-list-item[category-id=""]`));
    myApp.services.categories.bindOnCheckboxChange(page.querySelector(`#default-category-list ons-list-item:not([category-id])`));

    // Change splitter animation depending on platform.
    document.querySelector(`#mySplitter`).left.setAttribute(`animation`, ons.platform.isAndroid() ? `overlay` : `reveal`);

    page.querySelector(`[component="button/supressAll"]`).onclick = function () {
      ons.notification.confirm(
        {
          title: `Voulez-vous vraiment tout supprimer ?`,
          message: `Les données précédentes vont être supprimées.`,
          buttonLabels: [`Abandonner`, `Confirmer`]
        }
      ).then(function (buttonIndex) {
        if (buttonIndex === 1) {
          // Si `confirmer` a été pressé, on efface tout.
          document.querySelector("#todo-list").innerHTML = "";
          document.querySelector("#pending-list").innerHTML = "";
          document.querySelector("#completed-list").innerHTML = "";
          document.querySelector("#archived-list").innerHTML = "";
          window.localStorage.setItem("liste", "");
        }
      });
    };

    page.querySelector(`[component="button/suppressDatePassed"]`).onclick = function () {
      ons.notification.confirm(
        {
          title: `Voulez-vous vraiment archiver toutes les activités passées ?`,
          message: `Les activités passées vont être archivées.`,
          buttonLabels: [`Abandonner`, `Confirmer`]
        }
      ).then(function (buttonIndex) {
        if (buttonIndex === 1) {

          //On filtre sur la date
          let contentList = JSON.parse(window.localStorage.getItem("liste"));

          if (contentList) {

            let today = new Date(Date.now());

            function condition(item) {
              return (new Date(item.date) < today && item.state != 4);
            }

            let i = contentList.findIndex(e => condition(e));

            let todoList = document.querySelector("#todo-list");
            let pendingList = document.querySelector("#pending-list");
            let completedList = document.querySelector("#completed-list");

            console.log(todoList);

            while (i != -1) {

              console.log(contentList[i]);
              contentList[i].state = 4;
              console.log(page);

              i = contentList.findIndex(e => condition(e));
            }

            window.localStorage.setItem("liste", JSON.stringify(contentList));

            todoList.innerHTML = "";
            pendingList.innerHTML = "";
            completedList.innerHTML = "";

            JSON.parse(window.localStorage.getItem("liste")).forEach(element => {
              myApp.services.tasks.create(element);
            });

          }
        }
      });

    };





  },

  ////////////////////////////
  // New Task Page Controller //
  ////////////////////////////
  newTaskPage: function (page) {
    // Set button functionality to save a new task.

    let choix = document.querySelector("#choose-sel");

    let decision

    choix.addEventListener("change", function (event) {

      if (event.target.value != "default") {
        decision = event.target.value;
      }

    })

    let categories = JSON.parse(window.localStorage.getItem("catégories"));

    categories.forEach(element => {
      let newOption = document.createElement("option");
      newOption.value = element;
      newOption.innerHTML = element;

      choix.children[0].appendChild(newOption);
    });



    Array.prototype.forEach.call(page.querySelectorAll(`[component="button/save-task"]`), function (element) {
      element.onclick = function () {
        var newTitle = page.querySelector(`#title-input`).value;


        if (newTitle) {
          // If input title is not empty, create a new task.

          // let 

          let content =
          {
            title: newTitle,
            category: decision ? decision : page.querySelector(`#category-input`).value,
            description: page.querySelector(`#description-input`).value,
            highlight: page.querySelector(`#highlight-input`).checked,
            urgent: page.querySelector(`#urgent-input`).checked,
            state: 0,
            date: page.querySelector(`#date-input`).value
          };

          let datas;
          try {
            datas = JSON.parse(window.localStorage.getItem("liste"));
            datas.push(content);
          } catch (error) {
            datas = [content];
          }

          //          console.log(datas);


          window.localStorage.setItem("liste", JSON.stringify(datas));

          myApp.services.tasks.create(content);

          // Set selected category to `All`, refresh and pop page.
          document.querySelector(`#default-category-list ons-list-item ons-radio`).checked = true;
          document.querySelector(`#default-category-list ons-list-item`).updateCategoryView();
          document.querySelector(`#myNavigator`).popPage();

        } else {
          // Show alert if the input title is empty.
          ons.notification.alert(`Vous devez définir un titre.`);
        }
      };
    });
  },

  ////////////////////////////////
  // Details Task Page Controller //
  ///////////////////////////////
  detailsTaskPage: function (page) {
    // Get the element passed as argument to pushPage.
    var element = page.data.element;

    let date = element.data.date ? new Date(element.data.date).toISOString().substring(0, 10) : "";


    // Fill the view with the stored data.
    let titleInput = page.querySelector(`#title-input`);
    titleInput.value = element.data.title;
    titleInput.disabled = element.data.state == 4;

    let categoryInput = page.querySelector(`#category-input`);
    categoryInput.value = element.data.category;
    categoryInput.disabled = element.data.state == 4;

    let descriptionInput = page.querySelector(`#description-input`)
    descriptionInput.value = element.data.description;
    descriptionInput.disabled = element.data.state == 4;

    let highlightInput = page.querySelector(`#highlight-input`)
    highlightInput.checked = element.data.highlight;
    highlightInput.disabled = element.data.state == 4;

    let urgentInput = page.querySelector(`#urgent-input`)
    urgentInput.checked = element.data.urgent;
    urgentInput.disabled = element.data.state == 4;

    let dateInput = page.querySelector(`#date-input`)
    dateInput.value = date;


    // Set button functionality to save an existing task.
    page.querySelector(`[component="button/save-task"]`).onclick = function () {
      var newTitle = page.querySelector(`#title-input`).value;

      if (newTitle) {
        // If input title is not empty, ask for confirmation before saving.
        ons.notification.confirm(
          {
            title: `Sauvegarder les changements ?`,
            message: `Les données précédentes vont être écrasées.`,
            buttonLabels: [`Abandonner`, `Confirmer`]
          }
        ).then(function (buttonIndex) {
          if (buttonIndex === 1) {
            // If `Save` button was pressed, overwrite the task.

            let newState;
            if (element.data.state == 4) {
              if (new Date(element.data.date) < new Date(Date.now())) {
                newState = element.data.state;
              } else {
                newState = 0;
              }
            } else {
              newState = element.data.state;
            }


            myApp.services.tasks.update(element,
              {
                title: newTitle,
                category: page.querySelector(`#category-input`).value,
                description: page.querySelector(`#description-input`).value,
                highlight: page.querySelector(`#highlight-input`).checked,
                urgent: element.data.urgent,
                state: newState,
                date: page.querySelector("#date-input").value
                //element.data.date
              }
            );

            // Set selected category to `All`, refresh and pop page.
            document.querySelector(`#default-category-list ons-list-item ons-radio`).checked = true;
            document.querySelector(`#default-category-list ons-list-item`).updateCategoryView();
            document.querySelector(`#myNavigator`).popPage();

          }
        });

      } else {
        // Show alert if the input title is empty.
        ons.notification.alert(`Vous devez définir un titre.`);
      }
    };
  }
};